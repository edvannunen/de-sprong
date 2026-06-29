### Added Specs:

## 26-6:

Ik wil alles toch naar het Engels. De combinatie Nederlands en Engels is te verwarrend. Alles mag dus naar het Engels, behalve de naam (De Sprong) en de subtitel (O, Romantiek Der Hazen). 
Voorstel, tenzij je betere hebt:

stuk = piece
toonsoort = key
bron = source
Oefenmateriaal = Exercises
Extra  Stap 1:
Maak een GitHub repository genaamd de-sprong onder github.com/edvannunen. Je kunt gh gebruiken. Maak een README.md met een beschrijving van het project, gebruikersinstructies, installatieinstructies inclusief dependencies.

Testing
**Vitest** (unit tests) + **Playwright** (end-to-end tests)

Verder graag DaisyUI ipv shadcn-svelte

-----

## Added specs 27-6-2026
I Want this to be added to the specs:
* As this a webapp that will mainly be used on an iPad it should be mobile first. Editing data (name, info etc) should be handled in a that fits mobile best. 
* Cascading delete: when a piece is deleted the underlying sources etc should be deleted as well
* Remove the fallback method for drag and drop as that should work on both desktop and mobile
* Add PWA to the later versions
* Add timestamps (created_at, updated_at) to piece and source
* Key (toonsoort) is in edit mode a dropdown field with the following values, in this order: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B, Cm, Dbm, Dm, Ebm, Em, Fm, Gbm, Gm, Abm, Am, Bbm, Bm). Can be hardcoded as it will never change, a seperate table is overkill 
## Piece page
* As this will be a list on a tab page, how can this be best handled in view/edit mode especially when used on mobile as well? Suggestions:
### Basic layout piece page
Have the name and the key on one line. The info (if present) in a smaller font below the line. Info can be max two lines
Three columns:
Name | Key | edit
- Show the name of the piece, clickable for the source page. Should be around 80%-90% of the table width
- Key is max three characters, so can be a small column. On edit mode it should be a dropdown (see above) 
- edit column hould have an edit button and delete button. Edit: name is a textbox, key a dropwdown, add a save and cancel button. delete should ALWAYS have a confirmation dialog 
## Source page
* On the Source page. Normal mode is tyhe view mode. As it is mainly used on iPad or it should be mobile first. It should have an edit and delete button at the bottom. On edit show save and cancel buttons. delete should ALWAYS have a confirmation dialog 
### Basic layout in view mode:
Name: ___________________________  Key: ___ 
Info: _____________________________________  (multiple liness if more data. Only a single linespace when no link)
Link: (YouTube/Spotify embed. Only a single linespace when no link)
Attachment: (thumbnail if present. Only a single linespace when no attachment)
### Specs source page:
Name: bold and bigger font. Textfield on edit mode
Key: align right side. Same font as Name, dropdown on edit mode (see above)
Info: normal fontsize. if there are multiple lines of info show them as multiple lines, otherwise use only one line. Editing mode use two line text box)
Link: show the youtube or spotify embedded, clickable link on other link. On edit modeL show the url
attachment : show a thumbnail, open in new tab. On Edit mode be able to upload a document. Als possible to delete attachmen t (after confirmation)

## design
It is for jazz-music practise, so it should have that look and feel 
Use https://github.com/Edvannunen/de-sprong/blob/main/De%20Sprong%20-%20banner.png as a top banner for the piece-page
Use the quarter note icon for the top_prio lines and a double eighth note icon for the rest
Use https://github.com/Edvannunen/de-sprong/blob/main/Source%20banner.png as a top banner for source page
Use https://github.com/Edvannunen/de-sprong/blob/main/Footer.jpg as the footer for all pages

---
### 28-6-2028
* General background color: white
* Use https://github.com/Edvannunen/de-sprong/blob/main/img/banner_piece.png for header of the piece page
* Use https://github.com/Edvannunen/de-sprong/blob/main/img/banner_source.png for the banner of the source page
* Use https://github.com/Edvannunen/de-sprong/blob/main/img/footer.png for the footer for all pages
* Use https://github.com/Edvannunen/de-sprong/blob/main/img/favicon.ico as the favicon

# ToDo's
* Make tabs dynamic. Edit tabs, move tabs, change color
* 