# CSS support

Every standard CSS property, at-rule, selector and value type, and whether PdfPecker draws it. Of the 599 properties below, PdfPecker supports 318, supports 25 in part and leaves out 145. Another 111 are for scrolling, animation and interaction, which have no effect on a printed page, so PdfPecker ignores them on purpose. [HTML and CSS support](/docs/html-and-css/) explains how the supported features behave, and [Limitations](/docs/limitations/) describes the gaps.

A declaration PdfPecker does not support is dropped like any unknown property: the rest of the rule still applies and the conversion does not fail. The property list is the standards-track properties in MDN's browser compatibility data, grouped by the specification that defines them, plus the paged media properties PdfPecker reads. Property names link to MDN.

## Properties

### Box model and sizing

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio) | ✓ Yes |  |
| [`block-ellipsis`](https://developer.mozilla.org/en-US/docs/Web/CSS/block-ellipsis) | ✓ Yes | auto or a string of your own ends a block cut short by line-clamp. |
| [`block-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/block-size) | ✓ Yes |  |
| [`box-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) | ✓ Yes |  |
| [`column-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-width) | ✓ Yes |  |
| [`contain`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain) | ✕ No | Layout is the same without it. |
| [`contain-intrinsic-block-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-block-size) | ✕ No | Only matters with content-visibility. |
| [`contain-intrinsic-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-height) | ✕ No | Only matters with content-visibility. |
| [`contain-intrinsic-inline-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-inline-size) | ✕ No | Only matters with content-visibility. |
| [`contain-intrinsic-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-size) | ✕ No | Only matters with content-visibility. |
| [`contain-intrinsic-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-width) | ✕ No | Only matters with content-visibility. |
| [`content-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) | ✕ No | Content is drawn even when set to hidden. |
| [`continue`](https://developer.mozilla.org/en-US/docs/Web/CSS/continue) | ✕ No | Use the line-clamp shorthand. |
| [`display`](https://developer.mozilla.org/en-US/docs/Web/CSS/display) | ✓ Yes | block, inline, inline-block, flow-root, flex, grid, list-item, contents, none, every table value, two-value forms and -webkit-box. |
| [`frame-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/frame-sizing) | ✕ No | Iframes are not loaded. |
| [`height`](https://developer.mozilla.org/en-US/docs/Web/CSS/height) | ✓ Yes |  |
| [`inline-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/inline-size) | ✓ Yes |  |
| [`line-clamp`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-clamp) | ✓ Yes | Also -webkit-line-clamp with display: -webkit-box. |
| [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin) | ✓ Yes |  |
| [`margin-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block) | ✓ Yes |  |
| [`margin-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block-end) | ✓ Yes |  |
| [`margin-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block-start) | ✓ Yes |  |
| [`margin-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom) | ✓ Yes |  |
| [`margin-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) | ✓ Yes |  |
| [`margin-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end) | ✓ Yes |  |
| [`margin-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-start) | ✓ Yes |  |
| [`margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left) | ✓ Yes |  |
| [`margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right) | ✓ Yes |  |
| [`margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top) | ✓ Yes |  |
| [`margin-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-trim) | ✕ No |  |
| [`max-block-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-block-size) | ✓ Yes |  |
| [`max-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height) | ✓ Yes |  |
| [`max-inline-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-inline-size) | ✓ Yes |  |
| [`max-lines`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-lines) | ✕ No | Use the line-clamp shorthand. |
| [`max-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-size) | ✕ No | Newer shorthand; use max-width and max-height. |
| [`max-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-width) | ✓ Yes |  |
| [`min-block-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-block-size) | ✓ Yes |  |
| [`min-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-height) | ✓ Yes |  |
| [`min-inline-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-inline-size) | ✓ Yes |  |
| [`min-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-size) | ✕ No | Newer shorthand; use min-width and min-height. |
| [`min-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width) | ✓ Yes |  |
| [`order`](https://developer.mozilla.org/en-US/docs/Web/CSS/order) | ✓ Yes |  |
| [`overflow`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow) | ✓ Yes | auto and scroll clip like hidden, since paper cannot scroll. |
| [`overflow-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-block) | ✕ No | Only the media feature of that name is answered. |
| [`overflow-clip-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-margin) | ✕ No |  |
| [`overflow-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-inline) | ✕ No | Only the media feature of that name is answered. |
| [`overflow-x`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x) | ✓ Yes | As overflow. |
| [`overflow-y`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y) | ✓ Yes | As overflow. |
| [`padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding) | ✓ Yes |  |
| [`padding-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block) | ✓ Yes |  |
| [`padding-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block-end) | ✓ Yes |  |
| [`padding-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block-start) | ✓ Yes |  |
| [`padding-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom) | ✓ Yes |  |
| [`padding-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline) | ✓ Yes |  |
| [`padding-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-end) | ✓ Yes |  |
| [`padding-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline-start) | ✓ Yes |  |
| [`padding-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-left) | ✓ Yes |  |
| [`padding-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-right) | ✓ Yes |  |
| [`padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top) | ✓ Yes |  |
| [`reading-flow`](https://developer.mozilla.org/en-US/docs/Web/CSS/reading-flow) | – No effect | Only changes keyboard focus order. |
| [`reading-order`](https://developer.mozilla.org/en-US/docs/Web/CSS/reading-order) | – No effect | Only changes keyboard focus order. |
| [`scroll-axis-lock`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-axis-lock) | – No effect |  |
| [`scroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior) | – No effect |  |
| [`scroll-marker-group`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-marker-group) | – No effect |  |
| [`scroll-target-group`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-target-group) | – No effect |  |
| [`scrollbar-gutter`](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter) | – No effect |  |
| [`size`](https://developer.mozilla.org/en-US/docs/Web/CSS/size) | ✓ Yes | The @page descriptor: A4, Letter, landscape or any length. |
| [`text-overflow`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow) | ✓ Yes | ellipsis, clip and strings. |
| [`visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/visibility) | ✓ Yes |  |
| [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width) | ✓ Yes | Also min-content, max-content and fit-content. |

### Borders, outlines and shadows

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`border`](https://developer.mozilla.org/en-US/docs/Web/CSS/border) | ✓ Yes |  |
| [`border-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block) | ✓ Yes |  |
| [`border-block-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-color) | ✓ Yes |  |
| [`border-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end) | ✓ Yes |  |
| [`border-block-end-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-color) | ✓ Yes |  |
| [`border-block-end-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-style) | ✓ Yes |  |
| [`border-block-end-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-end-width) | ✓ Yes |  |
| [`border-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start) | ✓ Yes |  |
| [`border-block-start-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-color) | ✓ Yes |  |
| [`border-block-start-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-style) | ✓ Yes |  |
| [`border-block-start-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-width) | ✓ Yes |  |
| [`border-block-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-style) | ✓ Yes |  |
| [`border-block-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-width) | ✓ Yes |  |
| [`border-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom) | ✓ Yes |  |
| [`border-bottom-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color) | ✓ Yes |  |
| [`border-bottom-left-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius) | ✓ Yes |  |
| [`border-bottom-right-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius) | ✓ Yes |  |
| [`border-bottom-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-style) | ✓ Yes |  |
| [`border-bottom-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-width) | ✓ Yes |  |
| [`border-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-color) | ✓ Yes |  |
| [`border-end-end-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-end-radius) | ✓ Yes |  |
| [`border-end-start-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-end-start-radius) | ✓ Yes |  |
| [`border-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image) | ✓ Yes |  |
| [`border-image-outset`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-outset) | ✓ Yes |  |
| [`border-image-repeat`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-repeat) | ✓ Yes |  |
| [`border-image-slice`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-slice) | ✓ Yes |  |
| [`border-image-source`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source) | ✓ Yes |  |
| [`border-image-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width) | ✓ Yes |  |
| [`border-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline) | ✓ Yes |  |
| [`border-inline-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-color) | ✓ Yes |  |
| [`border-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end) | ✓ Yes |  |
| [`border-inline-end-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-color) | ✓ Yes |  |
| [`border-inline-end-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-style) | ✓ Yes |  |
| [`border-inline-end-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-end-width) | ✓ Yes |  |
| [`border-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start) | ✓ Yes |  |
| [`border-inline-start-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-color) | ✓ Yes |  |
| [`border-inline-start-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-style) | ✓ Yes |  |
| [`border-inline-start-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-start-width) | ✓ Yes |  |
| [`border-inline-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-style) | ✓ Yes |  |
| [`border-inline-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-inline-width) | ✓ Yes |  |
| [`border-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left) | ✓ Yes |  |
| [`border-left-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-color) | ✓ Yes |  |
| [`border-left-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-style) | ✓ Yes |  |
| [`border-left-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-width) | ✓ Yes |  |
| [`border-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius) | ✓ Yes | Elliptical radii and percentages. |
| [`border-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right) | ✓ Yes |  |
| [`border-right-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-color) | ✓ Yes |  |
| [`border-right-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-style) | ✓ Yes |  |
| [`border-right-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-width) | ✓ Yes |  |
| [`border-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-shape) | ✕ No |  |
| [`border-start-end-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-end-radius) | ✓ Yes |  |
| [`border-start-start-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-start-start-radius) | ✓ Yes |  |
| [`border-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style) | ✓ Yes |  |
| [`border-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top) | ✓ Yes |  |
| [`border-top-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color) | ✓ Yes |  |
| [`border-top-left-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius) | ✓ Yes |  |
| [`border-top-right-radius`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius) | ✓ Yes |  |
| [`border-top-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style) | ✓ Yes |  |
| [`border-top-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width) | ✓ Yes |  |
| [`border-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-width) | ✓ Yes |  |
| [`box-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) | ✓ Yes | Inset shadows on inline elements are not drawn. |
| [`corner-block-end-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-block-end-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-block-start-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-block-start-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-bottom-left-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-bottom-left-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-bottom-right-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-bottom-right-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-bottom-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-bottom-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-end-end-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-end-end-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-end-start-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-end-start-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-inline-end-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-inline-end-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-inline-start-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-inline-start-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-left-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-left-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-right-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-right-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-start-end-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-start-end-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-start-start-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-start-start-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-top-left-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-top-left-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-top-right-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-top-right-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`corner-top-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-top-shape) | ✕ No | corner-shape is not supported; border-radius is. |
| [`outline`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline) | ✓ Yes |  |
| [`outline-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color) | ✓ Yes |  |
| [`outline-offset`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset) | ✓ Yes |  |
| [`outline-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style) | ✓ Yes |  |
| [`outline-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width) | ✓ Yes |  |

### Backgrounds and images

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) | ✓ Yes | Several layers, gradients and images. |
| [`background-attachment`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment) | ✓ Yes | fixed images are placed against the paper on every page, as in Chrome; fixed gradients move with their box. |
| [`background-clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip) | ✓ Yes | Also text and -webkit-background-clip. |
| [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) | ✓ Yes |  |
| [`background-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-image) | ✓ Yes |  |
| [`background-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin) | ✓ Yes |  |
| [`background-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position) | ✓ Yes |  |
| [`background-position-x`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position-x) | ✓ Yes |  |
| [`background-position-y`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position-y) | ✓ Yes |  |
| [`background-repeat`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat) | ✓ Yes |  |
| [`background-repeat-x`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat-x) | ✕ No | Use background-repeat. |
| [`background-repeat-y`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat-y) | ✕ No | Use background-repeat. |
| [`background-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size) | ✓ Yes |  |
| [`image-orientation`](https://developer.mozilla.org/en-US/docs/Web/CSS/image-orientation) | ✓ Yes | from-image (the EXIF orientation) and none. |
| [`image-rendering`](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering) | ✕ No | Images are left to the PDF viewer, which smooths them. |
| [`object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) | ✓ Yes |  |
| [`object-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) | ✓ Yes |  |
| [`object-view-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-view-box) | ✕ No |  |

### Positioning, floats and shapes

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`anchor-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name) | ✕ No | Anchor positioning is not supported. |
| [`anchor-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-scope) | ✕ No | Anchor positioning is not supported. |
| [`bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/bottom) | ✓ Yes |  |
| [`clear`](https://developer.mozilla.org/en-US/docs/Web/CSS/clear) | ✓ Yes |  |
| [`float`](https://developer.mozilla.org/en-US/docs/Web/CSS/float) | ✓ Yes | Also inline-start, inline-end and footnote. |
| [`inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset) | ✓ Yes |  |
| [`inset-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block) | ✓ Yes |  |
| [`inset-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-end) | ✓ Yes |  |
| [`inset-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-start) | ✓ Yes |  |
| [`inset-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline) | ✓ Yes |  |
| [`inset-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-end) | ✓ Yes |  |
| [`inset-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/inset-inline-start) | ✓ Yes |  |
| [`left`](https://developer.mozilla.org/en-US/docs/Web/CSS/left) | ✓ Yes |  |
| [`overlay`](https://developer.mozilla.org/en-US/docs/Web/CSS/overlay) | – No effect | Only for dialogs and popovers in the top layer. |
| [`position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) | ✓ Yes | fixed repeats on every page; sticky is drawn as relative, as in Chrome print. |
| [`position-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-anchor) | ✕ No | Anchor positioning is not supported. |
| [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) | ✕ No | Anchor positioning is not supported. |
| [`position-try`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try) | ✕ No | Anchor positioning is not supported. |
| [`position-try-fallbacks`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks) | ✕ No | Anchor positioning is not supported. |
| [`position-try-order`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-order) | ✕ No | Anchor positioning is not supported. |
| [`position-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-visibility) | ✕ No | Anchor positioning is not supported. |
| [`right`](https://developer.mozilla.org/en-US/docs/Web/CSS/right) | ✓ Yes |  |
| [`shape-image-threshold`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-image-threshold) | ✓ Yes |  |
| [`shape-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-margin) | ✓ Yes |  |
| [`shape-outside`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-outside) | ✓ Yes | Basic shapes, boxes and images; SVG images fall back to the margin box. |
| [`top`](https://developer.mozilla.org/en-US/docs/Web/CSS/top) | ✓ Yes |  |
| [`z-index`](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index) | ✓ Yes |  |

### Flexbox, grid and alignment

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`align-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/align-content) | ✓ Yes |  |
| [`align-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items) | ✓ Yes |  |
| [`align-self`](https://developer.mozilla.org/en-US/docs/Web/CSS/align-self) | ✓ Yes |  |
| [`fit-tolerance`](https://developer.mozilla.org/en-US/docs/Web/CSS/fit-tolerance) | ✕ No |  |
| [`flex`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex) | ✓ Yes |  |
| [`flex-basis`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis) | ✓ Yes |  |
| [`flex-direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction) | ✓ Yes |  |
| [`flex-flow`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-flow) | ✓ Yes |  |
| [`flex-grow`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow) | ✓ Yes |  |
| [`flex-line-count`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-line-count) | ✕ No |  |
| [`flex-shrink`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink) | ✓ Yes |  |
| [`flex-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap) | ✓ Yes |  |
| [`grid`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid) | ✕ No | The grid shorthand is not expanded; use grid-template and grid-auto-flow. @supports wrongly reports it as supported. |
| [`grid-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area) | ✓ Yes |  |
| [`grid-auto-columns`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns) | ✓ Yes |  |
| [`grid-auto-flow`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow) | ✓ Yes | Including dense. |
| [`grid-auto-rows`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows) | ✓ Yes |  |
| [`grid-column`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column) | ✓ Yes |  |
| [`grid-column-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end) | ✓ Yes |  |
| [`grid-column-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start) | ✓ Yes |  |
| [`grid-row`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row) | ✓ Yes |  |
| [`grid-row-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end) | ✓ Yes |  |
| [`grid-row-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start) | ✓ Yes |  |
| [`grid-template`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template) | ✓ Yes |  |
| [`grid-template-areas`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas) | ✓ Yes |  |
| [`grid-template-columns`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns) | ✓ Yes | repeat(), minmax(), fit-content(), named lines and subgrid (horizontal writing modes). |
| [`grid-template-rows`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows) | ✓ Yes | As grid-template-columns. |
| [`justify-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content) | ✓ Yes |  |
| [`justify-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items) | ✓ Yes |  |
| [`justify-self`](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self) | ✓ Yes |  |
| [`place-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/place-content) | ✓ Yes |  |
| [`place-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/place-items) | ✓ Yes |  |
| [`place-self`](https://developer.mozilla.org/en-US/docs/Web/CSS/place-self) | ✓ Yes |  |

### Multi-column and gap rules

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`column-count`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-count) | ✓ Yes |  |
| [`column-fill`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-fill) | ✓ Yes |  |
| [`column-gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap) | ✓ Yes |  |
| [`column-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-height) | ✕ No |  |
| [`column-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule) | ✓ Yes | Between columns of a multi-column box. |
| [`column-rule-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-break) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-color) | ✓ Yes |  |
| [`column-rule-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-cap`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-cap) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-cap-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-cap-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-cap-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-cap-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-junction`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-junction) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-junction-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-junction-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-junction-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-junction-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-inset-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-inset-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-style) | ✓ Yes |  |
| [`column-rule-visibility-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-visibility-items) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`column-rule-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-width) | ✓ Yes |  |
| [`column-span`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-span) | ✓ Yes | all works on direct children of the multi-column box. |
| [`column-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/column-wrap) | ✕ No |  |
| [`columns`](https://developer.mozilla.org/en-US/docs/Web/CSS/columns) | ✓ Yes |  |
| [`gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/gap) | ✓ Yes |  |
| [`row-gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-gap) | ✓ Yes |  |
| [`row-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-break) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-color) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-cap`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-cap) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-cap-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-cap-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-cap-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-cap-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-junction`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-junction) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-junction-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-junction-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-junction-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-junction-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-inset-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-inset-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-style) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-visibility-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-visibility-items) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`row-rule-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/row-rule-width) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-break) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-color) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-inset) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-inset-cap`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-inset-cap) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-inset-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-inset-end) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-inset-junction`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-inset-junction) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-inset-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-inset-start) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-overlap`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-overlap) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-style) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-visibility-items`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-visibility-items) | ✕ No | Gap decorations beyond column-rule are not supported. |
| [`rule-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/rule-width) | ✕ No | Gap decorations beyond column-rule are not supported. |

### Fonts

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`font`](https://developer.mozilla.org/en-US/docs/Web/CSS/font) | ✓ Yes |  |
| [`font-family`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) | ✓ Yes | Bundled fonts, @font-face and fonts you register. |
| [`font-feature-settings`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings) | ½ Partly | Contextual GSUB lookups are skipped. |
| [`font-kerning`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-kerning) | ✓ Yes |  |
| [`font-language-override`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-language-override) | ✕ No |  |
| [`font-optical-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-optical-sizing) | ✓ Yes |  |
| [`font-palette`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-palette) | ✕ No |  |
| [`font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size) | ✓ Yes |  |
| [`font-size-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust) | ✓ Yes |  |
| [`font-stretch`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch) | ✓ Yes |  |
| [`font-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style) | ✓ Yes |  |
| [`font-synthesis`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis) | ✓ Yes |  |
| [`font-synthesis-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis-position) | ✓ Yes |  |
| [`font-synthesis-small-caps`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis-small-caps) | ✓ Yes |  |
| [`font-synthesis-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis-style) | ✓ Yes |  |
| [`font-synthesis-weight`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis-weight) | ✓ Yes |  |
| [`font-variant`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant) | ½ Partly | Contextual OpenType substitutions are skipped; small caps are synthesized when the font lacks them. |
| [`font-variant-alternates`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-alternates) | ✕ No |  |
| [`font-variant-caps`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps) | ½ Partly | Small caps synthesized when the font has no smcp feature. |
| [`font-variant-east-asian`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-east-asian) | ✓ Yes |  |
| [`font-variant-emoji`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-emoji) | ✕ No |  |
| [`font-variant-ligatures`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-ligatures) | ½ Partly | Contextual alternates are skipped. |
| [`font-variant-numeric`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric) | ✓ Yes |  |
| [`font-variant-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-position) | ✓ Yes |  |
| [`font-variation-settings`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings) | ✓ Yes |  |
| [`font-weight`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) | ✓ Yes |  |
| [`font-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-width) | ✕ No | New name for font-stretch, which works. |

### Text, lines and writing modes

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`alignment-baseline`](https://developer.mozilla.org/en-US/docs/Web/CSS/alignment-baseline) | ✓ Yes | In SVG text. |
| [`baseline-shift`](https://developer.mozilla.org/en-US/docs/Web/CSS/baseline-shift) | ✕ No |  |
| [`baseline-source`](https://developer.mozilla.org/en-US/docs/Web/CSS/baseline-source) | ✕ No |  |
| [`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction) | ✓ Yes |  |
| [`dominant-baseline`](https://developer.mozilla.org/en-US/docs/Web/CSS/dominant-baseline) | ✓ Yes | In SVG text. |
| [`glyph-orientation-vertical`](https://developer.mozilla.org/en-US/docs/Web/CSS/glyph-orientation-vertical) | ✕ No |  |
| [`hanging-punctuation`](https://developer.mozilla.org/en-US/docs/Web/CSS/hanging-punctuation) | ✕ No |  |
| [`hyphenate-character`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-character) | ✓ Yes |  |
| [`hyphenate-limit-chars`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-limit-chars) | ✓ Yes |  |
| [`hyphenate-limit-lines`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-limit-lines) | ✕ No |  |
| [`hyphens`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens) | ✓ Yes | Built-in dictionaries for many languages, chosen by lang. |
| [`initial-letter`](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter) | ✓ Yes | On ::first-letter, as in Chrome; not in vertical writing modes. |
| [`letter-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing) | ✓ Yes |  |
| [`line-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-break) | ✓ Yes |  |
| [`line-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) | ✓ Yes |  |
| [`math-depth`](https://developer.mozilla.org/en-US/docs/Web/CSS/math-depth) | ✕ No | MathML is not laid out. |
| [`math-shift`](https://developer.mozilla.org/en-US/docs/Web/CSS/math-shift) | ✕ No | MathML is not laid out. |
| [`math-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/math-style) | ✕ No | MathML is not laid out. |
| [`overflow-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap) | ✓ Yes |  |
| [`ruby-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-align) | ✕ No | Ruby annotations are not laid out. |
| [`ruby-overhang`](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-overhang) | ✕ No | Ruby annotations are not laid out. |
| [`ruby-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-position) | ✕ No | Ruby annotations are not laid out. |
| [`tab-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size) | ✓ Yes |  |
| [`text-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align) | ✓ Yes | Right-to-left and bidi lines justify at spaces only. |
| [`text-align-last`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-align-last) | ✓ Yes |  |
| [`text-autospace`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-autospace) | ✕ No |  |
| [`text-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box) | ✕ No |  |
| [`text-box-edge`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-edge) | ✕ No |  |
| [`text-box-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim) | ✕ No |  |
| [`text-combine-upright`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-combine-upright) | ✕ No |  |
| [`text-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-fit) | ✕ No |  |
| [`text-indent`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent) | ✓ Yes |  |
| [`text-justify`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-justify) | ✓ Yes | inter-character spreads CJK text. |
| [`text-orientation`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-orientation) | ✕ No | No upright CJK in vertical text. |
| [`text-spacing-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim) | ½ Partly | normal, space-all, space-first and trim-start; needs a font with the halt feature. |
| [`text-transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform) | ✓ Yes |  |
| [`text-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap) | ✓ Yes | balance (up to six lines), pretty and stable. |
| [`text-wrap-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-mode) | ✓ Yes |  |
| [`text-wrap-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style) | ✓ Yes | As text-wrap. |
| [`unicode-bidi`](https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-bidi) | ✓ Yes |  |
| [`vertical-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align) | ✓ Yes | Keywords, lengths and percentages. |
| [`-webkit-text-fill-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-fill-color) | ✓ Yes |  |
| [`-webkit-text-stroke`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke) | ✓ Yes | Text stays selectable text. |
| [`-webkit-text-stroke-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke-color) | ✓ Yes |  |
| [`-webkit-text-stroke-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke-width) | ✓ Yes |  |
| [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space) | ✓ Yes |  |
| [`white-space-collapse`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space-collapse) | ✕ No | Use white-space. |
| [`white-space-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space-trim) | ✕ No |  |
| [`word-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break) | ✓ Yes |  |
| [`word-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing) | ✓ Yes |  |
| [`wrap-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/wrap-inside) | ✕ No |  |
| [`writing-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode) | ½ Partly | Vertical modes are drawn as turned horizontal text, as Chrome does for Latin; CJK is not set upright. |

### Text decoration

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`text-decoration`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration) | ✓ Yes |  |
| [`text-decoration-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color) | ✓ Yes |  |
| [`text-decoration-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-inset) | ✕ No |  |
| [`text-decoration-line`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line) | ✓ Yes |  |
| [`text-decoration-skip`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip) | ✕ No | Use text-decoration-skip-ink. |
| [`text-decoration-skip-ink`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip-ink) | ✓ Yes |  |
| [`text-decoration-skip-spaces`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-skip-spaces) | ✕ No |  |
| [`text-decoration-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style) | ✓ Yes | Wavy and dashed lines differ a little from Chrome. |
| [`text-decoration-thickness`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness) | ✓ Yes |  |
| [`text-emphasis`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis) | ✕ No |  |
| [`text-emphasis-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-color) | ✕ No |  |
| [`text-emphasis-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-position) | ✕ No |  |
| [`text-emphasis-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-emphasis-style) | ✕ No |  |
| [`text-shadow`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow) | ✓ Yes |  |
| [`text-underline-offset`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-offset) | ✓ Yes |  |
| [`text-underline-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-underline-position) | ✓ Yes | under and from-font, as in Chrome. |

### Colour, effects and masks

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | ✓ Yes | The backdrop is a 144 dpi raster; up to 64 per document. Also -webkit-backdrop-filter. |
| [`background-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode) | ✓ Yes |  |
| [`clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip) | ✓ Yes | rect() on absolutely and fixed positioned boxes. Deprecated; clip-path is the modern form. |
| [`clip-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path) | ✓ Yes | Basic shapes, reference boxes and url(#id). |
| [`clip-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-rule) | ✓ Yes |  |
| [`color`](https://developer.mozilla.org/en-US/docs/Web/CSS/color) | ✓ Yes | Every colour syntax; wide-gamut colours are mapped to sRGB. |
| [`color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-adjust) | – No effect | Backgrounds always print, as with exact. |
| [`color-interpolation-filters`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-filters) | ✓ Yes |  |
| [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) | – No effect | Pages are always light, as in print. |
| [`dynamic-range-limit`](https://developer.mozilla.org/en-US/docs/Web/CSS/dynamic-range-limit) | – No effect |  |
| [`filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) | ✓ Yes | blur() and drop-shadow() are rasterized at 144 dpi; the rest stay vector. |
| [`flood-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/flood-color) | ✓ Yes |  |
| [`flood-opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/flood-opacity) | ✓ Yes |  |
| [`forced-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/forced-color-adjust) | – No effect |  |
| [`isolation`](https://developer.mozilla.org/en-US/docs/Web/CSS/isolation) | ✓ Yes |  |
| [`lighting-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/lighting-color) | ✓ Yes |  |
| [`mask`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask) | ✓ Yes | Soft masks on HTML and SVG; text stays text. Also -webkit-mask. |
| [`mask-border`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border) | ✕ No |  |
| [`mask-border-outset`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-outset) | ✕ No |  |
| [`mask-border-repeat`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-repeat) | ✕ No |  |
| [`mask-border-slice`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-slice) | ✕ No |  |
| [`mask-border-source`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-source) | ✕ No |  |
| [`mask-border-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-width) | ✕ No |  |
| [`mask-clip`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip) | ✓ Yes |  |
| [`mask-composite`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite) | ✓ Yes |  |
| [`mask-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image) | ✓ Yes |  |
| [`mask-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-mode) | ✓ Yes |  |
| [`mask-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin) | ✓ Yes |  |
| [`mask-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-position) | ✓ Yes |  |
| [`mask-repeat`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-repeat) | ✓ Yes |  |
| [`mask-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size) | ✓ Yes |  |
| [`mask-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-type) | ✓ Yes |  |
| [`mix-blend-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) | ✓ Yes |  |
| [`opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) | ✓ Yes |  |
| [`print-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust) | – No effect | Backgrounds always print, as with exact. |

### Transforms and motion paths

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`backface-visibility`](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility) | ½ Partly | Drawn as Chrome print does. |
| [`offset`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset) | ✕ No | Motion paths are not supported. |
| [`offset-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-anchor) | ✕ No |  |
| [`offset-distance`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-distance) | ✕ No |  |
| [`offset-path`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-path) | ✕ No |  |
| [`offset-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-position) | ✕ No |  |
| [`offset-rotate`](https://developer.mozilla.org/en-US/docs/Web/CSS/offset-rotate) | ✕ No |  |
| [`perspective`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective) | ½ Partly | Flattened; perspective boxes stay parallelograms. |
| [`perspective-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin) | ½ Partly | Flattened with perspective. |
| [`rotate`](https://developer.mozilla.org/en-US/docs/Web/CSS/rotate) | ✓ Yes | 3D axes are flattened. |
| [`scale`](https://developer.mozilla.org/en-US/docs/Web/CSS/scale) | ✓ Yes |  |
| [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) | ½ Partly | 2D is exact; 3D functions are flattened because PDF is affine. |
| [`transform-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box) | ✕ No |  |
| [`transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) | ✓ Yes |  |
| [`transform-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style) | ½ Partly | preserve-3d is flattened. |
| [`translate`](https://developer.mozilla.org/en-US/docs/Web/CSS/translate) | ✓ Yes |  |

### Lists, counters and generated content

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`content`](https://developer.mozilla.org/en-US/docs/Web/CSS/content) | ✓ Yes | Strings, attr(), counters, quotes, string(), target-counter(), target-text(), leader(), and url() and gradients as inline images. |
| [`counter-increment`](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-increment) | ✓ Yes |  |
| [`counter-reset`](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-reset) | ✓ Yes |  |
| [`counter-set`](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-set) | ✓ Yes |  |
| [`list-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style) | ✓ Yes |  |
| [`list-style-image`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-image) | ✓ Yes | Images and gradients; image-set() shows the list-style-type instead. |
| [`list-style-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position) | ✓ Yes |  |
| [`list-style-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type) | ✓ Yes | Every Counter Styles 3 style and @counter-style. |
| [`quotes`](https://developer.mozilla.org/en-US/docs/Web/CSS/quotes) | ✓ Yes | Including auto by lang. |

### Tables

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`border-collapse`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse) | ✓ Yes | Collapsed-border conflicts can differ from Chrome in rare cases. |
| [`border-spacing`](https://developer.mozilla.org/en-US/docs/Web/CSS/border-spacing) | ✓ Yes |  |
| [`caption-side`](https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side) | ✓ Yes |  |
| [`empty-cells`](https://developer.mozilla.org/en-US/docs/Web/CSS/empty-cells) | ✓ Yes |  |
| [`table-layout`](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout) | ✓ Yes |  |

### Paged media and breaks

| Property | PdfPecker | Notes |
| --- | --- | --- |
| `bookmark-label` | ✓ Yes | content(), strings and attr(). |
| `bookmark-level` | ✓ Yes | Makes any block a bookmark, or leaves a heading out with none. |
| `bookmark-state` | ✓ Yes | open or closed. |
| [`box-decoration-break`](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break) | ½ Partly | Only for inline boxes, not for blocks split across pages. |
| [`break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-after) | ✓ Yes |  |
| [`break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before) | ✓ Yes |  |
| [`break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside) | ✓ Yes |  |
| `footnote-display` | ½ Partly | compact is drawn inline. |
| `footnote-policy` | ½ Partly | block acts like line. |
| [`orphans`](https://developer.mozilla.org/en-US/docs/Web/CSS/orphans) | ✓ Yes |  |
| [`page`](https://developer.mozilla.org/en-US/docs/Web/CSS/page) | ✓ Yes | Named pages with their own @page size and margins. |
| [`page-break-after`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-after) | ✓ Yes |  |
| [`page-break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-before) | ✓ Yes |  |
| [`page-break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside) | ✓ Yes |  |
| `-pdfpecker-scale-to-fit` | ✓ Yes | PdfPecker’s own property: shrink fits text of any length into a fixed-size box. |
| `position: running()` | ✕ No | Use string-set or the sticky header and footer instead. |
| `string-set` | ✓ Yes | Running headers with string(). |
| [`widows`](https://developer.mozilla.org/en-US/docs/Web/CSS/widows) | ✓ Yes |  |

### SVG properties

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`color-interpolation`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation) | ✕ No |  |
| [`cx`](https://developer.mozilla.org/en-US/docs/Web/CSS/cx) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`cy`](https://developer.mozilla.org/en-US/docs/Web/CSS/cy) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`d`](https://developer.mozilla.org/en-US/docs/Web/CSS/d) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`fill`](https://developer.mozilla.org/en-US/docs/Web/CSS/fill) | ✓ Yes |  |
| [`fill-opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity) | ✓ Yes |  |
| [`fill-rule`](https://developer.mozilla.org/en-US/docs/Web/CSS/fill-rule) | ✓ Yes |  |
| [`marker`](https://developer.mozilla.org/en-US/docs/Web/CSS/marker) | ✓ Yes |  |
| [`marker-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-end) | ✓ Yes |  |
| [`marker-mid`](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-mid) | ✓ Yes |  |
| [`marker-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/marker-start) | ✓ Yes |  |
| [`paint-order`](https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order) | ✓ Yes | On SVG and on HTML text with -webkit-text-stroke. |
| [`path-length`](https://developer.mozilla.org/en-US/docs/Web/CSS/path-length) | ✕ No |  |
| [`pointer-events`](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events) | – No effect |  |
| [`r`](https://developer.mozilla.org/en-US/docs/Web/CSS/r) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`rx`](https://developer.mozilla.org/en-US/docs/Web/CSS/rx) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`ry`](https://developer.mozilla.org/en-US/docs/Web/CSS/ry) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`shape-rendering`](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-rendering) | – No effect |  |
| [`stop-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/stop-color) | ½ Partly | From the attribute or the stop’s style attribute, not from style sheets. |
| [`stop-opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/stop-opacity) | ½ Partly | From the attribute or the stop’s style attribute, not from style sheets. |
| [`stroke`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke) | ✓ Yes |  |
| [`stroke-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-color) | ✕ No | Use stroke. |
| [`stroke-dasharray`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dasharray) | ✓ Yes |  |
| [`stroke-dashoffset`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dashoffset) | ✓ Yes |  |
| [`stroke-linecap`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-linecap) | ✓ Yes |  |
| [`stroke-linejoin`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-linejoin) | ✓ Yes |  |
| [`stroke-miterlimit`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-miterlimit) | ✓ Yes |  |
| [`stroke-opacity`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-opacity) | ✓ Yes |  |
| [`stroke-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-width) | ✓ Yes |  |
| [`text-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-anchor) | ✓ Yes | In SVG text. |
| [`text-rendering`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-rendering) | – No effect | Kerning and ligatures follow font-kerning and font-variant. |
| [`vector-effect`](https://developer.mozilla.org/en-US/docs/Web/CSS/vector-effect) | ✕ No |  |
| [`x`](https://developer.mozilla.org/en-US/docs/Web/CSS/x) | ½ Partly | Read from the SVG attribute, not from CSS. |
| [`y`](https://developer.mozilla.org/en-US/docs/Web/CSS/y) | ½ Partly | Read from the SVG attribute, not from CSS. |

### Cascade, variables and containers

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`all`](https://developer.mozilla.org/en-US/docs/Web/CSS/all) | ✓ Yes |  |
| [`container`](https://developer.mozilla.org/en-US/docs/Web/CSS/container) | ½ Partly | Size queries and style(--custom); no scroll-state(). |
| [`container-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/container-name) | ✓ Yes |  |
| [`container-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/container-type) | ✓ Yes |  |
| [`--*`](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) | ✓ Yes | Custom properties (--*) and var() anywhere, @property too. |
| [`interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size) | – No effect | Only affects animations. |

### Prefixed and legacy names

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`grid-column-gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-gap) | ✓ Yes | Read as column-gap. |
| [`grid-gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-gap) | ✓ Yes | Read as gap. |
| [`grid-row-gap`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-gap) | ✓ Yes | Read as row-gap. |
| `-moz-tab-size` | ✓ Yes | Read as tab-size. |
| `-webkit-backdrop-filter` | ✓ Yes | Read as backdrop-filter. |
| `-webkit-background-clip` | ✓ Yes | Read as background-clip. |
| `-webkit-box, -webkit-box-orient, -webkit-box-pack, -webkit-box-align, -webkit-box-flex` | ✓ Yes | Read as the old flexbox, as in Chrome. |
| `-webkit-box-decoration-break` | ✓ Yes | Read as box-decoration-break. |
| `-webkit-hyphenate-character` | ✓ Yes | Read as hyphenate-character. |
| `-webkit-hyphens` | ✓ Yes | Read as hyphens. |
| `-webkit-line-clamp` | ✓ Yes | Read as line-clamp. |
| `-webkit-mask` | ✓ Yes | Read as mask, and every -webkit-mask-* longhand. |
| `-webkit-transform, -webkit-border-radius, -webkit-box-shadow and the other -webkit- names Chrome accepts` | ✓ Yes | Read as their standard property. |
| `-webkit-writing-mode` | ✓ Yes | Read as writing-mode. |
| [`word-wrap`](https://developer.mozilla.org/en-US/docs/Web/CSS/word-wrap) | ✓ Yes | Read as overflow-wrap. |

### Interaction, animation and scrolling

| Property | PdfPecker | Notes |
| --- | --- | --- |
| [`accent-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color) | ✕ No | Checkboxes and radio buttons keep their default colours. |
| [`animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) | – No effect |  |
| [`animation-composition`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition) | – No effect |  |
| [`animation-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay) | – No effect |  |
| [`animation-direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction) | – No effect |  |
| [`animation-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration) | – No effect |  |
| [`animation-fill-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode) | – No effect |  |
| [`animation-iteration-count`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count) | – No effect |  |
| [`animation-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name) | – No effect |  |
| [`animation-play-state`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state) | – No effect |  |
| [`animation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range) | – No effect |  |
| [`animation-range-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range-end) | – No effect |  |
| [`animation-range-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range-start) | – No effect |  |
| [`animation-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) | – No effect |  |
| [`animation-timing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function) | – No effect |  |
| [`animation-trigger`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-trigger) | – No effect |  |
| [`appearance`](https://developer.mozilla.org/en-US/docs/Web/CSS/appearance) | ✕ No | Form controls always keep their default look. |
| [`caret-animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/caret-animation) | – No effect |  |
| [`caret-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/caret-color) | – No effect |  |
| [`caret-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/caret-shape) | – No effect |  |
| [`cursor`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor) | – No effect |  |
| [`field-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) | ✕ No | Form fields keep their default size. |
| [`ime-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/ime-mode) | – No effect |  |
| [`interactivity`](https://developer.mozilla.org/en-US/docs/Web/CSS/interactivity) | – No effect |  |
| [`interest-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/interest-delay) | – No effect |  |
| [`interest-delay-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/interest-delay-end) | – No effect |  |
| [`interest-delay-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/interest-delay-start) | – No effect |  |
| [`link-parameters`](https://developer.mozilla.org/en-US/docs/Web/CSS/link-parameters) | ✕ No |  |
| [`overflow-anchor`](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor) | – No effect |  |
| [`overscroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) | – No effect |  |
| [`overscroll-behavior-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-block) | – No effect |  |
| [`overscroll-behavior-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-inline) | – No effect |  |
| [`overscroll-behavior-x`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-x) | – No effect |  |
| [`overscroll-behavior-y`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior-y) | – No effect |  |
| [`resize`](https://developer.mozilla.org/en-US/docs/Web/CSS/resize) | – No effect |  |
| [`scroll-initial-target`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-initial-target) | – No effect |  |
| [`scroll-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin) | – No effect |  |
| [`scroll-margin-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block) | – No effect |  |
| [`scroll-margin-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block-end) | – No effect |  |
| [`scroll-margin-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-block-start) | – No effect |  |
| [`scroll-margin-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-bottom) | – No effect |  |
| [`scroll-margin-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline) | – No effect |  |
| [`scroll-margin-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline-end) | – No effect |  |
| [`scroll-margin-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-inline-start) | – No effect |  |
| [`scroll-margin-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-left) | – No effect |  |
| [`scroll-margin-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-right) | – No effect |  |
| [`scroll-margin-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top) | – No effect |  |
| [`scroll-padding`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding) | – No effect |  |
| [`scroll-padding-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block) | – No effect |  |
| [`scroll-padding-block-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block-end) | – No effect |  |
| [`scroll-padding-block-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-block-start) | – No effect |  |
| [`scroll-padding-bottom`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-bottom) | – No effect |  |
| [`scroll-padding-inline`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline) | – No effect |  |
| [`scroll-padding-inline-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline-end) | – No effect |  |
| [`scroll-padding-inline-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-inline-start) | – No effect |  |
| [`scroll-padding-left`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-left) | – No effect |  |
| [`scroll-padding-right`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-right) | – No effect |  |
| [`scroll-padding-top`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding-top) | – No effect |  |
| [`scroll-snap-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align) | – No effect |  |
| [`scroll-snap-stop`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-stop) | – No effect |  |
| [`scroll-snap-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type) | – No effect |  |
| [`scroll-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline) | – No effect |  |
| [`scroll-timeline-axis`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-axis) | – No effect |  |
| [`scroll-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-timeline-name) | – No effect |  |
| [`scrollbar-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color) | – No effect |  |
| [`scrollbar-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width) | – No effect |  |
| [`speak`](https://developer.mozilla.org/en-US/docs/Web/CSS/speak) | – No effect |  |
| [`speak-as`](https://developer.mozilla.org/en-US/docs/Web/CSS/speak-as) | – No effect |  |
| [`text-size-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-size-adjust) | – No effect | Only for phone browsers. |
| [`timeline-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-scope) | – No effect |  |
| [`timeline-trigger`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger) | – No effect |  |
| [`timeline-trigger-activation-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-activation-range) | – No effect |  |
| [`timeline-trigger-activation-range-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-activation-range-end) | – No effect |  |
| [`timeline-trigger-activation-range-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-activation-range-start) | – No effect |  |
| [`timeline-trigger-active-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-active-range) | – No effect |  |
| [`timeline-trigger-active-range-end`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-active-range-end) | – No effect |  |
| [`timeline-trigger-active-range-start`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-active-range-start) | – No effect |  |
| [`timeline-trigger-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-name) | – No effect |  |
| [`timeline-trigger-source`](https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-trigger-source) | – No effect |  |
| [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) | – No effect |  |
| [`transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition) | – No effect |  |
| [`transition-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior) | – No effect |  |
| [`transition-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay) | – No effect |  |
| [`transition-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration) | – No effect |  |
| [`transition-property`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-property) | – No effect |  |
| [`transition-timing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) | – No effect |  |
| [`trigger-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/trigger-scope) | – No effect |  |
| [`user-select`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select) | – No effect |  |
| [`view-timeline`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline) | – No effect |  |
| [`view-timeline-axis`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline-axis) | – No effect |  |
| [`view-timeline-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline-inset) | – No effect |  |
| [`view-timeline-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-timeline-name) | – No effect |  |
| [`view-transition-class`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class) | – No effect |  |
| [`view-transition-group`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-group) | – No effect |  |
| [`view-transition-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name) | – No effect |  |
| [`view-transition-scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-scope) | – No effect |  |
| [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change) | – No effect |  |
| [`window-drag`](https://developer.mozilla.org/en-US/docs/Web/CSS/window-drag) | – No effect |  |
| [`zoom`](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom) | ✕ No |  |

## At-rules

| At-rule | PdfPecker | Notes |
| --- | --- | --- |
| [`@charset`](https://developer.mozilla.org/en-US/docs/Web/CSS/@charset) | ✓ Yes |  |
| [`@import`](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) | ✓ Yes | With layer(), supports() and media queries. Remote files load only through your ResourceResolver. |
| [`@media`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) | ✓ Yes | print and all match, screen does not. Page width, height, aspect-ratio, orientation, ranges, and/or/not, plus resolution, color, prefers-color-scheme (light), hover and pointer (none), overflow-block (paged) and more. |
| [`@supports`](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports) | ✓ Yes | Property tests, selector(), font-format() and font-tech(). |
| [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) | ✓ Yes | Including the !important reversal. |
| [`@container`](https://developer.mozilla.org/en-US/docs/Web/CSS/@container) | ½ Partly | Size queries and style(--custom); no scroll-state(). |
| [`@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) | ✓ Yes | syntax, inherits and initial-value. |
| [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) | ½ Partly | src (url(), local(), format()), font-weight and font-stretch ranges, font-style, unicode-range. font-display is accepted; size-adjust and the metric overrides are ignored. |
| [`@counter-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@counter-style) | ✓ Yes | Every system and descriptor. |
| [`@page`](https://developer.mozilla.org/en-US/docs/Web/CSS/@page) | ✓ Yes | size, margins, backgrounds, :first, :left, :right, :blank, named pages and all 16 margin boxes. marks, bleed and page-orientation are ignored. |
| [`@footnote`](https://developer.mozilla.org/en-US/docs/Web/CSS/@footnote) | ✓ Yes | The footnote area inside @page. |
| [`@namespace`](https://developer.mozilla.org/en-US/docs/Web/CSS/@namespace) | ½ Partly | Accepted and ignored; HTML needs no namespaces. |
| [`CSS nesting (&)`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting) | ✓ Yes |  |
| [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope) | ✕ No | Rules inside are skipped. |
| [`@font-feature-values`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-feature-values) | ✕ No |  |
| [`@font-palette-values`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-palette-values) | ✕ No |  |
| [`@custom-media`](https://developer.mozilla.org/en-US/docs/Web/CSS/@custom-media) | ✕ No |  |
| [`@function`](https://developer.mozilla.org/en-US/docs/Web/CSS/@function) | ✕ No |  |
| [`@position-try`](https://developer.mozilla.org/en-US/docs/Web/CSS/@position-try) | ✕ No | Anchor positioning is not supported. |
| [`@keyframes`](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) | – No effect | No animations on paper. |
| [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) | – No effect | Only used for transitions. |
| [`@view-transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) | – No effect |  |
| [`@document`](https://developer.mozilla.org/en-US/docs/Web/CSS/@document) | ✕ No | Obsolete Firefox rule. |

## Selectors

A rule whose selector PdfPecker cannot parse is skipped as a whole, as browsers do. Interaction states are parsed and never match, as in Chrome's print output.

| Selector | PdfPecker | Notes |
| --- | --- | --- |
| Type, class, id and universal (\*) | ✓ Yes |  |
| [Attribute: \[a\], =, ~=, \|=, ^=, $=, \*= and the i and s flags](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) | ✓ Yes |  |
| Combinators: descendant, >, + and ~ | ✓ Yes |  |
| [Nesting selector &](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector) | ✓ Yes |  |
| [`:root`](https://developer.mozilla.org/en-US/docs/Web/CSS/:root) | ✓ Yes |  |
| [`:empty`](https://developer.mozilla.org/en-US/docs/Web/CSS/:empty) | ✓ Yes |  |
| [`:first-child`, `:last-child`, `:only-child`](https://developer.mozilla.org/en-US/docs/Web/CSS/:first-child) | ✓ Yes |  |
| [`:nth-child()`, `:nth-last-child()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child) | ✓ Yes | Including An+B of S. |
| [`:first-of-type`, `:last-of-type`, `:only-of-type`, `:nth-of-type()`, `:nth-last-of-type()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-of-type) | ✓ Yes |  |
| [`:not()`, `:is()`, `:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) | ✓ Yes | Complex selector lists; :is() and :where() are forgiving. Also :matches() and :-webkit-any(). |
| [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) | ✓ Yes | Relative selectors; :has() cannot nest inside :has(), as the spec says. |
| [`:lang()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:lang) | ✓ Yes |  |
| [`:dir()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:dir) | ✓ Yes | From the dir attribute. |
| [`:link`, `:any-link`](https://developer.mozilla.org/en-US/docs/Web/CSS/:any-link) | ✓ Yes |  |
| [`:scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope) | ✓ Yes | Matches the root. |
| [`:defined`](https://developer.mozilla.org/en-US/docs/Web/CSS/:defined) | ✓ Yes |  |
| [`:checked`, `:default`](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) | ✓ Yes |  |
| [`:disabled`, `:enabled`](https://developer.mozilla.org/en-US/docs/Web/CSS/:disabled) | ✓ Yes |  |
| [`:required`, `:optional`](https://developer.mozilla.org/en-US/docs/Web/CSS/:required) | ✓ Yes |  |
| [`:read-only`, `:read-write`](https://developer.mozilla.org/en-US/docs/Web/CSS/:read-only) | ✓ Yes |  |
| [`:placeholder-shown`](https://developer.mozilla.org/en-US/docs/Web/CSS/:placeholder-shown) | ✓ Yes |  |
| [`::before`, `::after`](https://developer.mozilla.org/en-US/docs/Web/CSS/::before) | ✓ Yes |  |
| [`::marker`](https://developer.mozilla.org/en-US/docs/Web/CSS/::marker) | ✓ Yes |  |
| [`::first-letter`](https://developer.mozilla.org/en-US/docs/Web/CSS/::first-letter) | ✓ Yes | With initial-letter for drop caps. |
| [`::first-line`](https://developer.mozilla.org/en-US/docs/Web/CSS/::first-line) | ✓ Yes |  |
| [`::placeholder`](https://developer.mozilla.org/en-US/docs/Web/CSS/::placeholder) | ✓ Yes | On text fields and textareas. |
| `::footnote-call`, `::footnote-marker` | ✓ Yes | From CSS Generated Content for Paged Media. |
| [`@page :first`, `:left`, `:right`, `:blank`](https://developer.mozilla.org/en-US/docs/Web/CSS/:first) | ✓ Yes |  |
| [`:valid`, `:invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:valid) | ✕ No | Rules with them are skipped. |
| [`:in-range`, `:out-of-range`](https://developer.mozilla.org/en-US/docs/Web/CSS/:in-range) | ✕ No | Rules with them are skipped. |
| [`:open`](https://developer.mozilla.org/en-US/docs/Web/CSS/:open) | ✕ No | Use [open] for details elements. |
| `:heading`, `:heading()` | ✕ No |  |
| [`:state()`, `:host`, `:host()`, `:host-context()`, `::part()`, `::slotted()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) | ✕ No | No shadow DOM: scripts do not run. |
| [`::details-content`](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content) | ✕ No |  |
| `::checkmark`, `::picker()`, `::picker-icon` | ✕ No |  |
| Column combinator \|\| and :nth-col() | ✕ No |  |
| [Namespace selector ns\|E](https://developer.mozilla.org/en-US/docs/Web/CSS/Namespace_separator) | ✕ No |  |
| [`:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`, `:visited`, `:target`](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover) | – No effect | Parsed, never match, as in Chrome print. |
| `:indeterminate`, `:autofill`, `:user-valid`, `:user-invalid`, `:fullscreen`, `:modal`, `:popover-open`, `:playing`, `:paused` | – No effect | Parsed, never match. |
| [`::selection`, `::highlight()`, `::spelling-error`, `::grammar-error`, `::target-text`, `::search-text`](https://developer.mozilla.org/en-US/docs/Web/CSS/::selection) | – No effect | Nothing is selected on paper. |
| `::backdrop`, `::file-selector-button`, `::cue`, `::view-transition-*`, `::scroll-marker`, `::scroll-button()` | – No effect |  |

## Units, colours and functions

| Value | PdfPecker | Notes |
| --- | --- | --- |
| [px, pt, pc, in, cm, mm, Q, %](https://developer.mozilla.org/en-US/docs/Web/CSS/length) | ✓ Yes |  |
| [em, rem](https://developer.mozilla.org/en-US/docs/Web/CSS/length) | ✓ Yes |  |
| [ex, ch, cap, ic, lh and rex, rch, rcap, ric, rlh](https://developer.mozilla.org/en-US/docs/Web/CSS/length) | ✓ Yes | Measured from the font. |
| [vw, vh, vmin, vmax, vi, vb and the sv\*, lv\*, dv\* sets](https://developer.mozilla.org/en-US/docs/Web/CSS/length) | ✓ Yes | The viewport is the page content area. |
| [cqw, cqh, cqi, cqb, cqmin, cqmax](https://developer.mozilla.org/en-US/docs/Web/CSS/length) | ✓ Yes |  |
| [fr](https://developer.mozilla.org/en-US/docs/Web/CSS/flex_value) | ✓ Yes | In grid tracks. |
| [deg, rad, grad, turn](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) | ✓ Yes |  |
| [dpi, dpcm, dppx](https://developer.mozilla.org/en-US/docs/Web/CSS/resolution) | ✓ Yes | In media queries. |
| [s, ms, Hz, kHz](https://developer.mozilla.org/en-US/docs/Web/CSS/time) | – No effect | Only used by animations and speech. |
| [Named colours, hex (3, 4, 6, 8 digits), currentColor, transparent](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color) | ✓ Yes |  |
| [rgb(), rgba(), hsl(), hsla(), hwb()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | ✓ Yes |  |
| [lab(), lch(), oklab(), oklch(), color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | ✓ Yes | Wide-gamut colours are mapped to sRGB. |
| [color-mix(), relative colours (from)](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) | ✓ Yes |  |
| [light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) | ✓ Yes | Takes the light colour. |
| contrast-color() | ✕ No |  |
| Device CMYK and spot colours (device-cmyk()) | ✕ No | Colours are written as RGB. |
| [calc(), min(), max(), clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) | ✓ Yes |  |
| [round(), mod(), rem(), abs(), sign()](https://developer.mozilla.org/en-US/docs/Web/CSS/round) | ✓ Yes |  |
| [sin(), cos(), tan(), asin(), acos(), atan(), atan2()](https://developer.mozilla.org/en-US/docs/Web/CSS/sin) | ✓ Yes |  |
| [pow(), sqrt(), hypot(), log(), exp()](https://developer.mozilla.org/en-US/docs/Web/CSS/pow) | ✓ Yes |  |
| calc-size(), progress(), random(), sibling-index(), sibling-count(), if() | ✕ No |  |
| [var() and custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/var) | ✓ Yes | Anywhere, in shorthands and inside math. |
| [env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env) | ✕ No |  |
| [attr()](https://developer.mozilla.org/en-US/docs/Web/CSS/attr) | ½ Partly | In content only; no typed attr() in other properties. |
| [url()](https://developer.mozilla.org/en-US/docs/Web/CSS/url_value) | ✓ Yes | Data URIs, local files and, through your ResourceResolver, remote files. Stylesheets in data: URLs too. |
| [linear-gradient(), radial-gradient(), conic-gradient() and repeating forms](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient) | ✓ Yes | Drawn as PDF shadings, with colour interpolation methods such as in oklch. Also the old -webkit-gradient() syntax. |
| [image-set()](https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set) | ✕ No | Not drawn; use url(). For HTML images, srcset and picture work. |
| [cross-fade(), element(), paint()](https://developer.mozilla.org/en-US/docs/Web/CSS/cross-fade) | ✕ No |  |
| [counter(), counters(), symbols()](https://developer.mozilla.org/en-US/docs/Web/CSS/counter) | ✓ Yes |  |
| string(), content(), target-counter(), target-text(), leader() | ✓ Yes | Paged media functions. |
| target-counters() | ✕ No |  |
| [anchor(), anchor-size()](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor) | ✕ No |  |
| [Basic shapes: inset(), circle(), ellipse(), polygon(), path()](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape) | ✓ Yes | In clip-path and shape-outside. |
| xywh(), rect(), shape(), ray(), superellipse() | ✕ No |  |
| [repeat(), minmax(), fit-content()](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat) | ✓ Yes | In grid tracks. |
| [Transform functions: translate, scale, rotate, skew, matrix](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function) | ✓ Yes |  |
| [3D transform functions and perspective()](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function) | ½ Partly | Flattened, because PDF is affine. |
| [Filter functions: blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate, sepia, url()](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function) | ✓ Yes | blur and drop-shadow are rasterized at 144 dpi. |
| [inherit, initial, unset, revert, revert-layer](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Inheritance) | ✓ Yes | Also on shorthands. |
| [!important](https://developer.mozilla.org/en-US/docs/Web/CSS/important) | ✓ Yes |  |
