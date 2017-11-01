# [Searchstone.io](http://searchstone.io)

![Searchstone](https://cdn-images-1.medium.com/max/2000/1*TDiE4_ANWjtekDNZmisj-g.png)

[Searchstone.io](http://searchstone.io) is an open source search engine for the Heartstone card playing video game.
It relies on [Algolia](https://community.algolia.com/?utm_medium=link&utm_source=github&utm_campaign=searchstone) API for the search and [instantsearch.js](https://community.algolia.com/instantsearch.js/?utm_medium=link&utm_source=githubm&utm_campaign=searchstone) for the UI.

Read the project story on Medium:
[A painstakingly crafted search for Hearthstone](https://medium.com/@Kevin_Granger/a-painstakingly-crafted-search-for-hearthstone-c21b3fa4223c)

If you want to be involved in that project there are many ways to participate. You could obviously open issues or submit some PR on this github repo and we initiated the discussion on the [Show & Tell section of Algolia's community forum](https://discourse.algolia.com/t/searchstone-io-search-for-hearthstone-updated/2902/5).
You can also find us participating to the [Hearthsim community](https://hearthsim.info/) on Discord.

## Features
- Search as-you-type experience
- Full-text search in name, description and attributes
- Smart Highlighting
- Multi-language support
- Typo tolerance
- List and grid views
- Refinement on every attributes (Set, Race, Type, Mana, Class, Mechanics, Attack, Health)
- Golden animations cards
- Responsive design + Retina support
- Top decks
- Search by Artist
- Speed ⚡
- PWA (in progress)

## Development

### Run the website
```shell
$> yarn install
$> npm run dev
```

### Build for production (deployed by Netlify)

```shell
$> npm run build
```

### Extension Release Update

#### Config API keys

- edit 'config.json', add your Algolia and Cloudinary credentials (App ID/ API key).

#### Extract pics

- First, update your game to latest version.
- The following commands will install dependencies in a virtual environment:
  ```shell
  $> python3 -m venv myenv
  $> source myenv/bin/activate
  $> pip install --upgrade pip setuptools wheel
  $> pip install unitypack decrunch
  $> pip install lz4 hearthstone unitypack pillow
  ```
- Now, download and run HearthSim's extract script:
  ```shell
  $> git clone https://github.com/HearthSim/HearthstoneJSON.git
  $> cd HearthstoneJSON
  $> python ./generate_card_textures.py --outdir=textures/ /Applications/Hearthstone/Data/OSX/card*.unity3d //or whatever is your game directory
  $> deactivate
  ```
- copy only the .jpg images from HearthstoneJSON/textures/512px/ to your searchstone/import/art/ folder
- run script to upload files to Cloudinary
  ```shell
  $> gulp cloudinary:upload
  ```

#### Update records in Algolia Index

- Select the latest version here https://api.hearthstonejson.com/v1/
- Download card collectible in 'all' languages (ie. https://api.hearthstonejson.com/v1/20970/all/cards.collectible.json)
- Put the file in import/in
- Run import.js script:
  ```shell
  $> node import
  ```
- upload import/out/algolia-hearthstone.json manually to Algolia (do not use the gulp script, setup is outdated)
  ```shell
  $> gulp algolia:index
  ```

### Script update
- look at potential changes on https://hearthstonejson.com/
- update variables set (ie. "ICECROWN": "Frozen Throne"), setID (ie. "ICECROWN": 11), map (ie. "OVERLOAD": "Overload"), configure condition for set.format regarding the current year for standard.

### Algolia instantSearch.js configuration
- edit src/js/algolia-instantsearch-conf.js
- update set (ie: ICECROWN), setFull (ie. ICECROWN : "Frozen Throne")

### UI
- add set icons to the sketch file and export setIcons.svg
- add set class definition to hits.scss and refinements.scss

### Extra: Animated Golden Cards, Top Decks and Hearthpwn links
- update card list from Hearthpwn -> import-cards.js
- update deck list -> import-decks.js
- merge new data to your card index - merge-data.js
