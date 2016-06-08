# [Searchstone.io](http://searchstone.io)

![Searchstone]
(https://cdn-images-1.medium.com/max/2000/1*TDiE4_ANWjtekDNZmisj-g.png)

[Searchstone.io](http://searchstone.io) is an open source search engine for the Heartstone card playing video game.
It relies on [Algolia](https://community.algolia.com/?utm_medium=link&utm_source=github&utm_campaign=searchstone) API for the search and [instantsearch.js](https://community.algolia.com/instantsearch.js/?utm_medium=link&utm_source=githubm&utm_campaign=searchstone) for the UI.

I've published an article on Medium that explain a bit more the project: 
[A painstakingly crafted search for Hearthstone]
(https://medium.com/@Kevin_Granger/a-painstakingly-crafted-search-for-hearthstone-c21b3fa4223c)

## Features
- As-you-type experience
- Full-text search in name, description and attributes
- Smart Highlighting
- Multi-language support
- Typo tolerance
- Switch between grid/card and list view
- Refinement on every attributes (Set, Race, Type, Mana, Class, Mechanics, Attack, Health)
- Golden animations cards
- Responsive Design


## Change Log
-


## Dev

```shell
$> npm install
$> gulp dev
$> NODE_ENV=production gulp deploy
```


