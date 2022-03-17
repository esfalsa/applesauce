# Applesauce

**Applesauce** is a simple endorsement tool for NationStates.

## Installation

Applesauce is currently only tested on Google Chrome. To install it:

1. Download this repository as a [.zip archive](https://github.com/esfalsa/applesauce/archive/main.zip).
2. Open the .zip archive. You should get a folder called `applesauce-main`.
3. In your browser, open your extensions page at `chrome://extensions`.
4. In the top-right corner, enable developer mode.
5. Drag the `applesauce-main` folder anywhere onto the extensions page. Make sure you don't delete the folder in the future.
6. Navigate to [this page](https://www.nationstates.net/template-overall=none/page=blank/applesauce), which is where the extension injects content.

The extension does not receive automatic updates. To update to the newest version, you will need to re-install the extension.

## Features

Applesauce accepts a list of nations to endorse, and allows you to endorse those nations easily, one at a time, with a single endorse button. You can provide a full list, a nation to cross on, or a region to cross in.

You can also load nations with URL parameters. This is useful to create a link you can bookmark if there is a nation or region you cross in often, or if you and your organization all use Applesauce and wish to send Applesauce links directly.

- `nations` accepts a list of nations to endorse.
- `separator` accepts any character or string separating nations in the list. If not provided, it defaults to a comma.
- `nation` accepts the name of a nation to cross on.
- `region` accepts the name of a region to cross in.
- `reverse` reverses the order of nations to endorse, if included.

These are included in the URL as query parameters, e.g. as in `https://www.nationstates.net/template-overall=none/page=blank/applesauce?region=artificial_solar_system`.

## Legality

Users are responsible for ensuring the tools that they use are legal. Applesauce is fully open-source and users are strongly encouraged to review the code before using it. For convenience, a summary of how it works is below.

- After the initial pageload, one request is made to retrieve the user's `localid`.
- When the user submits a manual list of nations, no additional requests are made.
- When the user submits a nation to cross on, one additional request is made to that nation's page in order to retrieve the list of nations endorsing it.
- When the user submits a region to cross in, one additional request is made to that region's Ajax2 page.
- When the user presses the endorse button, the extension sends a GET request emulating the behavior when an endorse button is pressed on a nation page.
- If URL parameters are included, they are submitted automatically after the `localid` is retrieved.

All requests made by the extension are user-initiated and therefore [not subject](https://forum.nationstates.net/viewtopic.php?f=15&t=491427&p=37859790#p37859790) to the usual rate limits in the script rules. No requests are run simultaneously. The only requests that can be considered automated, even though they are initiated only when a user deliberately loads the Applesauce page, are the requests to fetch the user's `localid` and, if an applicable URL parameter is included, to fetch the nation or region to cross in. Because these requests are only run after user input to load the page, there is no automatic rate-limiting. If you would like to limit these to the 10 requests per minute allowed under the script rules, simply avoid refreshing the page too often.

## License

[MIT](/LICENSE)
