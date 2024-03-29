<div align="center">
  <img src="icons/icon.svg" width="80"/>
  <h1>Applesauce</h1>

[![License](https://img.shields.io/github/license/esfalsa/applesauce)](LICENSE)
[![Version](https://img.shields.io/github/manifest-json/v/esfalsa/applesauce?filename=manifest.json)](manifest.json#L4)

  <p>A simple endorsement tool for NationStates that provides a single button to endorse multiple nations, one at a time, from a single tab.</p>

[Report an Issue](https://github.com/esfalsa/applesauce/issues/new?labels=bug&template=bug_report.md) | [Request a Feature](https://github.com/esfalsa/applesauce/issues/new?labels=enhancement&template=feature_request.md) | [Download Current Version](https://github.com/esfalsa/applesauce/archive/main.zip)

</div>

## Installation

Applesauce is currently only tested on Google Chrome. To install it:

1. Download this repository as a [.zip archive](https://github.com/esfalsa/applesauce/archive/main.zip).
2. Open the .zip archive. You should get a folder called `applesauce-main`.
3. In your browser, open your extensions page at `chrome://extensions`.
4. In the top-right corner, enable developer mode.
5. Drag the `applesauce-main` folder anywhere onto the extensions page. Make sure you don't delete the folder in the future.
6. Navigate to [this page](https://www.nationstates.net/template-overall=none/page=blank/applesauce), which is where the extension injects content.

The extension does not receive automatic updates. To update to the newest version, you will need to re-install the extension. When doing so, make sure you also remove the previous version of the extension.

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

- When the user opens the Applesauce page, one request is made to retrieve the user's `localid` and currently logged-in nation.
- When the user submits a nation to cross on, requests are made to retrieve the `localid` and currently logged-in nation, and to the nation's page in order to retrieve the nations endorsing it.
- When the user submits a region to cross in, requests are made to retrieve the `localid` and currently logged-in nation, and to the region's Ajax2 activity page.
- When the user presses the endorse button, the extension sends a GET request emulating the behavior when an endorse button is pressed on a nation page.
- If URL parameters are included, they are inputted when the page loads.

All requests made by the extension are user-initiated and therefore [not subject](https://forum.nationstates.net/viewtopic.php?f=15&t=491427&p=37859790#p37859790) to the usual rate limits in the script rules. No requests are made without user input, whether by loading the extension page, by loading nations on the extension page, or by clicking the endorse button. No requests for endorsements are run simultaneously; as per the simultaneity rule, the button is disabled until a complete response is received from the NationStates server.

The only request that may be considered automated is the one that retrieves the user's `localid` and currently logged-in nation. This request is initiated only with the deliberate user action of loading the Applesauce page and follows the simultaneity rule.

## License

Applesauce is free and open-source software licensed under the [GNU Affero General Public License v3.0](/LICENSE).
