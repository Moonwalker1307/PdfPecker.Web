using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

// What the library's main branch has that the version the site uses does not: the commits merged after that
// version's tag, read from a clone of Moonwalker1307/PdfPecker. The Deploy workflow passes the clone with
// '--main <folder>', so the changelog on pdfpecker.net opens with an "Unreleased (main)" section while main is ahead
// and loses it by itself once the site moves to the release that holds those commits, whose own changelog section
// then sums them up. Builds without '--main' (CI, local runs) leave the section out, so the checked-in pages stay
// independent of the library's main.
static partial class DocsMain
{
    public const string Repository = "https://github.com/Moonwalker1307/PdfPecker";
    public const string Anchor = "unreleased-main";
    public const string FileName = "main.json";

    // Only commits that change the libraries count; tests, benchmarks, CI and the version numbers in the project
    // files are not something a reader of the changelog can use.
    static readonly string[] Paths = ["src/", ":(exclude,glob)src/**/*.csproj"];

    public static Unreleased Read(string clone, string siteVersion)
    {
        if (!Run(clone, ["rev-parse", "--verify", "--quiet", $"refs/tags/v{siteVersion}"], out _))
            throw new InvalidOperationException($"{clone} has no tag v{siteVersion}; clone the library with its tags.");
        var head = Run(clone, ["rev-parse", "--verify", "--quiet", "refs/remotes/origin/main"], out var remote) ? remote.Trim()
            : Run(clone, ["rev-parse", "HEAD"], out var local) ? local.Trim() : throw new InvalidOperationException($"{clone} is not a git clone.");

        // Releases after the site's version are listed apart: they are on nuget.org, but this manual does not describe
        // them yet. The rest is on main only.
        Run(clone, ["tag", "--list", "v*", "--merged", head], out var tagList);
        var newer = tagList.Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(t => t.Trim()[1..])
            .Where(v => Version.TryParse(v, out var parsed) && parsed > Version.Parse(siteVersion))
            .OrderBy(Version.Parse).ToList();
        var groups = new List<Group>();
        var from = $"v{siteVersion}";
        foreach (var tag in newer)
        {
            groups.Add(new Group(tag, Log(clone, from, $"v{tag}")));
            from = $"v{tag}";
        }
        groups.Add(new Group(null, Log(clone, from, head)));
        groups.Reverse();
        return new Unreleased(siteVersion, groups.Where(g => g.Commits.Count > 0).ToList());
    }

    static List<Commit> Log(string clone, string from, string to)
    {
        Run(clone, ["log", "--format=%H%x1f%cs%x1f%s", $"{from}..{to}", "--", .. Paths], out var output);
        return output.Split('\n', StringSplitOptions.RemoveEmptyEntries).Select(line => line.Split('\x1f'))
            .Select(f => new Commit(f[0], DateOnly.ParseExact(f[1], "yyyy-MM-dd", CultureInfo.InvariantCulture), f[2].Trim())).ToList();
    }

    // The section at the top of the changelog, in Markdown so it goes through the same renderer as the pages. The
    // entries are the commit subjects, which the library writes as short sentences, with their pull requests linked.
    public static string Markdown(Unreleased unreleased)
    {
        if (unreleased.Groups.Count == 0) return "";
        var sb = new StringBuilder();
        foreach (var group in unreleased.Groups)
        {
            if (group.Release == null)
            {
                var newest = group.Commits[0].Date.ToString("d MMMM yyyy", CultureInfo.InvariantCulture);
                sb.Append("## Unreleased (main)\n\n");
                sb.Append($"Merged into the library's [main branch]({Repository}/commits/main) after {unreleased.Since} and not on ");
                sb.Append($"NuGet yet, newest first, as of {newest}. The next release's section sums these up as one entry, and the ");
                sb.Append("manual describes them once that release is out.\n\n");
            }
            else
            {
                sb.Append($"## {group.Release} (on NuGet, not in this manual yet)\n\n");
                sb.Append($"Released on [NuGet](https://www.nuget.org/packages/PdfPecker/{group.Release}); this site still describes ");
                sb.Append($"{unreleased.Since}, and these are the commits of the release until its notes are written.\n\n");
            }
            foreach (var commit in group.Commits) sb.Append("- ").Append(Entry(commit)).Append('\n');
            sb.Append('\n');
        }
        return sb.ToString();
    }

    // The changelog with the section put before its first release.
    public static string InsertInto(string changelog, string section)
    {
        if (section.Length == 0) return changelog;
        var first = FirstRelease().Match(changelog);
        return first.Success ? changelog.Insert(first.Index, section) : changelog.TrimEnd() + "\n\n" + section;
    }

    // The line on the docs home page that points to the section.
    public static string HomeLine(Unreleased unreleased)
    {
        var count = unreleased.Groups.Sum(g => g.Commits.Count);
        if (count == 0) return "";
        return $"<p class=\"changes-more changes-main\"><a href=\"/docs/changelog/#{Anchor}\">{count} {(count == 1 ? "change" : "changes")} " +
            $"on main since {unreleased.Since}</a>, not in this manual yet.</p>";
    }

    // Tells the Deploy workflow's hourly check which commit the live changelog was built from, so it redeploys only
    // when main has a new commit that counts.
    public static string Json(Unreleased unreleased)
    {
        var head = unreleased.Groups.FirstOrDefault(g => g.Release == null)?.Commits[0].Sha ?? "";
        var count = unreleased.Groups.Sum(g => g.Commits.Count);
        return $"{{\n  \"since\": \"{unreleased.Since}\",\n  \"head\": \"{head}\",\n  \"commits\": {count.ToString(CultureInfo.InvariantCulture)}\n}}\n";
    }

    static string Entry(Commit commit)
    {
        var subject = commit.Subject;
        var pr = PullRequest().Match(subject);
        var link = pr.Success ? $" ([#{pr.Groups[1].Value}]({Repository}/pull/{pr.Groups[1].Value}))"
            : $" ([{commit.Sha[..7]}]({Repository}/commit/{commit.Sha}))";
        if (pr.Success) subject = subject[..pr.Index];
        return Escape(subject.TrimEnd()) + link;
    }

    // A subject is plain text apart from `code`, so everything Markdown or HTML would read as markup is escaped
    // outside the code spans: a subject that mentions <br> must not become a line break.
    static string Escape(string text)
    {
        var sb = new StringBuilder();
        var parts = text.Split('`');
        // An odd number of backticks has no code span to close, so then every backtick is plain text.
        var paired = parts.Length % 2 == 1;
        for (int i = 0; i < parts.Length; i++)
        {
            if (i > 0) sb.Append(paired ? "`" : "\\`");
            if (paired && i % 2 == 1) { sb.Append(parts[i]); continue; }
            foreach (var c in parts[i])
            {
                if (@"\*_[]<>&#!|~".Contains(c)) sb.Append('\\');
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    static bool Run(string folder, string[] args, out string output)
    {
        var start = new ProcessStartInfo("git") { RedirectStandardOutput = true, RedirectStandardError = true, WorkingDirectory = folder };
        start.ArgumentList.Add("-c");
        start.ArgumentList.Add("core.quotepath=off");
        foreach (var a in args) start.ArgumentList.Add(a);
        using var git = Process.Start(start) ?? throw new InvalidOperationException("git could not be started.");
        output = git.StandardOutput.ReadToEnd();
        var error = git.StandardError.ReadToEnd();
        git.WaitForExit();
        if (git.ExitCode != 0 && args[0] is "log" or "tag")
            throw new InvalidOperationException($"git {string.Join(' ', args)} failed in {folder}: {error.Trim()}");
        return git.ExitCode == 0;
    }

    [GeneratedRegex(@"^## ", RegexOptions.Multiline)]
    private static partial Regex FirstRelease();

    [GeneratedRegex(@"\s*\(#(\d+)\)\s*$")]
    private static partial Regex PullRequest();
}

record Commit(string Sha, DateOnly Date, string Subject);

// Release is null for the commits on main only, or the version of a release the site does not use yet.
record Group(string? Release, List<Commit> Commits);

record Unreleased(string Since, List<Group> Groups);
