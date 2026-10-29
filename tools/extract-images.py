#!/usr/bin/env python3
"""Extract only the game images whose mapping to a player-facing entity is confirmed, and record that mapping."""
import os, json, hashlib
import UnityPy
ROOT = r'C:/uTorria/Downloads/TCG Card Shop Simulator/Card Shop Simulator_Data'
OUT_DIR = os.path.join('content', 'assets', 'mapped')
MANIFEST = os.path.join('content', 'images-manifest.json')
MAPPINGS = [
  {'entity': 'the-counter-and-money', 'bundle': 'sharedassets1.assets', 'match': 'T_MoneyCoinGBP', 'file': 'the-counter-and-money-coin.png', 'note': 'texture of the currency coin handled at the counter'},
  {'entity': 'packs-and-opening', 'bundle': 'sharedassets1.assets', 'match': 'sactx-0-2048x2048-DXT5|BC3-CardPack_40_47-76a2caf7', 'file': 'packs-and-opening-cardpack-atlas-40-47.png', 'note': 'the game own sprite atlas for a further set of card packs'},
  {'entity': 'packs-and-opening', 'bundle': 'sharedassets1.assets', 'match': 'sactx-0-2048x2048-DXT5|BC3-CardPack_0_7-0a52a31b', 'file': 'packs-and-opening-cardpack-atlas.png', 'note': 'the game own sprite atlas for the first card packs'},
  {'entity': 'packs-and-opening', 'bundle': 'sharedassets1.assets', 'match': 'sactx-0-2048x2048-DXT5|BC3-CardPack_8_15-fce1a2a5', 'file': 'packs-and-opening-cardpack-atlas-8-15.png', 'note': 'the game own sprite atlas for the next set of card packs'},
  {'entity': 'card-sets-and-expansions', 'bundle': 'sharedassets2.assets', 'match': 'CardBorder_FirstEdition',
   'file': 'card-sets-and-expansions-border.jpg', 'note': "the game's own card border for the first-edition finish", 'max': 512, 'quality': 86},
  {'entity': 'card-sets-and-expansions', 'bundle': 'sharedassets2.assets', 'match': 'DestinyCardIcon',
   'file': 'card-sets-and-expansions-destiny.jpg', 'note': "the game's own icon for the Destiny card expansion", 'max': 512, 'quality': 86},
  {'entity': 'pack-tiers-and-names', 'bundle': 'sharedassets2.assets', 'match': 'sactx-0-2048x2048-DXT5|BC3-CardPack_16_23-ac7135a7',
   'file': 'pack-tiers-and-names-atlas.jpg', 'note': "the game's own sprite atlas for a further set of card packs", 'max': 1024, 'quality': 84},
  {'entity': 'pack-tiers-and-names', 'bundle': 'sharedassets2.assets', 'match': 'sactx-0-2048x2048-DXT5|BC3-CardPack_24_31-9488fdb8',
   'file': 'pack-tiers-and-names-atlas-24-31.jpg', 'note': "the game's own sprite atlas for another set of card packs", 'max': 1024, 'quality': 84},
  {'entity': 'how-tournament-standings-are-decided', 'bundle': 'sharedassets2.assets', 'match': 'Icon_Trophy',
   'file': 'how-tournament-standings-are-decided-trophy.jpg', 'note': "the game's own trophy icon used for the tournament the entry describes", 'max': 512, 'quality': 86},
  {'entity': 'what-a-ghost-card-does', 'bundle': 'sharedassets2.assets', 'match': 'GhostCardFrontIcon',
   'file': 'what-a-ghost-card-does-ghost.jpg', 'note': "the game's own front icon for a ghost card", 'max': 512, 'quality': 86},
  {'entity': 'the-kinds-of-customers', 'bundle': 'sharedassets2.assets', 'match': 'MaleCustomerPic 0',
   'file': 'the-kinds-of-customers-portrait.jpg', 'note': "one of the game's own customer portraits", 'max': 512, 'quality': 86},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_BinderPage_albedo", 'file': 'albums-and-binder-pages-binder.jpg', 'note': "albedo texture of the binder pages cards are stored in", 'max': 1024, 'quality': 84},
    {'entity': 'cards-and-rarity', 'bundle': 'sharedassets2.assets', 'match': "CardFront_Fire", 'file': 'cards-and-rarity-cardfront.jpg', 'note': "one of the game own card fronts, the card art the entry describes", 'max': 1024, 'quality': 84},
    {'entity': 'expanding-and-decorating-the-shop', 'bundle': 'sharedassets2.assets', 'match': "furniture texture2 albedo", 'file': 'expanding-and-decorating-the-shop-furniture.jpg', 'note': "albedo texture of the furniture the shop can be furnished with", 'max': 1024, 'quality': 84},
    {'entity': 'moving-on-old-stock', 'bundle': 'sharedassets2.assets', 'match': "PO_BulkDonationBox", 'file': 'moving-on-old-stock-donationbox.jpg', 'note': "texture of the bulk donation box old stock goes into", 'max': 1024, 'quality': 84},
    {'entity': 'price-changes-and-cash', 'bundle': 'sharedassets2.assets', 'match': "CashRegister_CashRegister_AlbedoTransparency", 'file': 'price-changes-and-cash-register.jpg', 'note': "albedo texture of the cash register money is taken at", 'max': 1024, 'quality': 84},
    {'entity': 'prices-and-price-tags', 'bundle': 'sharedassets2.assets', 'match': "PriceTagAtlas", 'file': 'prices-and-price-tags-atlas.jpg', 'note': "the game own atlas of the price tags you put on stock", 'max': 1024, 'quality': 84},
    {'entity': 'prize-shelves-and-specials', 'bundle': 'sharedassets2.assets', 'match': "PO_TournamentPrizeShelf", 'file': 'prize-shelves-and-specials-shelf.jpg', 'note': "the game own artwork for the shelf dedicated to tournament prizes", 'max': 1024, 'quality': 84},
    {'entity': 'rarity-and-how-it-is-chosen', 'bundle': 'sharedassets1.assets', 'match': "RainbowFoil", 'file': 'rarity-and-how-it-is-chosen-foil.jpg', 'note': "the game's own rainbow foil texture used on foil cards", 'max': 128, 'quality': 92},
    {'entity': 'scanner-restocking-workflow', 'bundle': 'sharedassets2.assets', 'match': "Barcode_Scanner_Diffuse", 'file': 'scanner-restocking-workflow-scanner.jpg', 'note': "diffuse texture of the barcode scanner used to restock", 'max': 1024, 'quality': 84},
    {'entity': 'shelves-stock-and-upgrades', 'bundle': 'sharedassets2.assets', 'match': "T_CylinderShelf", 'file': 'shelves-stock-and-upgrades-shelf.jpg', 'note': "texture of one of the shelf types the shop can be fitted with", 'max': 1024, 'quality': 84},
    {'entity': 'storage-shelves-and-restocking', 'bundle': 'sharedassets2.assets', 'match': "T_CardStorageShelf", 'file': 'storage-shelves-and-restocking-storage.jpg', 'note': "texture of the card storage shelving the back room uses", 'max': 1024, 'quality': 84},
    {'entity': 'the-card-game-you-can-play', 'bundle': 'sharedassets2.assets', 'match': "T_PlayTableNumber", 'file': 'the-card-game-you-can-play-playtable.jpg', 'note': "the game own play table marker used at the tables customers play on", 'max': 1024, 'quality': 84},
    {'entity': 'the-shop-billboard-and-your-shop-name', 'bundle': 'sharedassets2.assets', 'match': "Billboard_second", 'file': 'the-shop-billboard-and-your-shop-name-billboard.jpg', 'note': "the game own shop billboard texture the name is shown on", 'max': 1024, 'quality': 84},
    {'entity': 'tournaments-and-events', 'bundle': 'sharedassets2.assets', 'match': "HostTournamentScreenBG", 'file': 'tournaments-and-events-screen.jpg', 'note': "the background the game itself uses for the tournament screen", 'max': 1024, 'quality': 84},
    {'entity': 'the-upgrades-you-can-buy', 'bundle': 'sharedassets2.assets', 'match': "LevelUp_Icon", 'file': 'the-upgrades-you-can-buy-levelup.jpg', 'note': "the icon the game itself uses for a level up", 'max': 256, 'quality': 92},
    {'entity': 'the-screens-you-will-use-most', 'bundle': 'sharedassets2.assets', 'match': "ShopIcon", 'file': 'the-screens-you-will-use-most-shopicon.jpg', 'note': "the icon the game itself uses for the shop screen", 'max': 256, 'quality': 92},
    {'entity': 'the-warehouse-and-its-shelves', 'bundle': 'sharedassets2.assets', 'match': "PO_EmptyBoxStorage", 'file': 'the-warehouse-and-its-shelves-storage.jpg', 'note': "the game own artwork for the empty box storage used in the back room", 'max': 512, 'quality': 88},
    {'entity': 'the-currencies-the-game-tracks', 'bundle': 'sharedassets1.assets', 'match': "T_MoneyCoinEuro",
     'file': 'the-currencies-the-game-tracks-euro.jpg', 'note': "the coin texture the game ships for one of its currencies", 'max': 1024, 'quality': 84},
    {'entity': 'what-a-card-shows-in-play', 'bundle': 'sharedassets1.assets', 'match': "CardFrontIconOnly",
     'file': 'what-a-card-shows-in-play-icon.jpg', 'note': 'the icon-only card front the game itself uses for presenting a card', 'max': 512, 'quality': 88},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "Icon_EmptyPlaymat",
     'file': 'building-and-editing-a-deck-playmat.jpg', 'note': "the icon the game itself shows for an empty play mat", 'max': 512, 'quality': 88},
    {'entity': 'how-a-card-front-is-built', 'bundle': 'sharedassets2.assets', 'match': "CardFront_Air",
     'file': 'how-a-card-front-is-built-air.jpg', 'note': 'the game own card front for one of its elements', 'max': 1024, 'quality': 86},
    {'entity': 'restocking-from-a-cart', 'bundle': 'sharedassets2.assets', 'match': "CardboardBox_20x20x20_Albedo",
     'file': 'restocking-from-a-cart-box.jpg', 'note': 'the albedo texture of one of the cardboard boxes the game ships for stock', 'max': 1024, 'quality': 84},
    {'entity': 'opening-a-pack-on-screen', 'bundle': 'sharedassets2.assets', 'match': "T_CardBackMesh",
     'file': 'opening-a-pack-on-screen-cardback.jpg', 'note': 'the texture of a card back, what a card shows before it is revealed', 'max': 1024, 'quality': 86},
    {'entity': 'the-rules-of-the-card-game', 'bundle': 'sharedassets2.assets', 'match': "RulebookPlayArea",
     'file': 'the-rules-of-the-card-game-playarea.jpg', 'note': "the play area diagram the game itself prints in its rulebook", 'max': 1024, 'quality': 88},
    {'entity': 'setting-what-your-workers-do', 'bundle': 'sharedassets2.assets', 'match': "Icon_Worker0", 'type': 'Sprite',
     'file': 'setting-what-your-workers-do-icon.jpg', 'note': "one of the worker icons the game itself uses", 'max': 256, 'quality': 92},
    {'entity': 'board-games-and-their-accessories', 'bundle': 'sharedassets2.assets', 'match': "Icon_Boardgame_Speedrobo_Necro", 'type': 'Sprite',
     'file': 'board-games-and-their-accessories-icon.jpg', 'note': "one of the game own icons for the board games it sells", 'max': 256, 'quality': 92},
    {'entity': 'board-games-and-their-accessories', 'bundle': 'sharedassets2.assets', 'match': "Icon_Boardgame_Speedrobo_Claim", 'type': 'Sprite',
     'file': 'board-games-and-their-accessories-claim.png', 'note': "the box art the game ships for its Claim tabletop game, a miner holding up a golden nugget", 'max': 512},
    {'entity': 'board-games-and-their-accessories', 'bundle': 'sharedassets2.assets', 'match': "Icon_Boardgame_Speedrobo_SystemGate1", 'type': 'Sprite',
     'file': 'board-games-and-their-accessories-system-gate.png', 'note': "the box art the game ships for a two-player System Gate battle box", 'max': 512},
    {'entity': 'board-games-and-their-accessories', 'bundle': 'sharedassets2.assets', 'match': "Icon_Boardgame_Speedrobo_SystemGate2", 'type': 'Sprite',
     'file': 'board-games-and-their-accessories-system-gate-2.png', 'note': "the box art the game ships for a second two-player System Gate battle box", 'max': 512},
    {'entity': 'the-restocker-and-its-vehicles', 'bundle': 'sharedassets2.assets', 'match': "Icon_RestockBox",
     'file': 'the-restocker-and-its-vehicles-box.jpg', 'note': "the icon the game uses for the restock deliveries", 'max': 256, 'quality': 92},
    {'entity': 'machines-that-work-on-their-own', 'bundle': 'sharedassets2.assets', 'match': "T_Cleanser_BaseColor",
     'file': 'machines-that-work-on-their-own-cleanser.jpg', 'note': "the base colour texture of the automatic cleanser the game ships", 'max': 512, 'quality': 88},
    {'entity': 'sending-cards-to-be-graded', 'bundle': 'sharedassets1.assets', 'match': "GradedCardCaseBack",
     'file': 'sending-cards-to-be-graded-case.jpg', 'note': "the texture of the case a graded card is returned in", 'max': 512, 'quality': 88},
    {'entity': 'the-reveal-screen', 'bundle': 'sharedassets2.assets', 'match': "Icon_Gallery",
     'file': 'the-reveal-screen-gallery.jpg', 'note': "the gallery icon the game itself draws on its reveal screen", 'max': 512, 'quality': 88},
    {'entity': 'what-a-card-shows-in-play', 'bundle': 'sharedassets2.assets', 'match': "Icon_Fire",
     'file': 'what-a-card-shows-in-play-fire.jpg', 'note': "one of the element icons the game itself prints on a card in play", 'max': 256, 'quality': 92},
    {'entity': 'what-a-card-shows-in-play', 'bundle': 'sharedassets2.assets', 'match': "Icon_Water",
     'file': 'what-a-card-shows-in-play-water.jpg', 'note': "a second element icon the game itself prints on a card in play", 'max': 256, 'quality': 92},
    {'entity': 'what-a-card-shows-in-play', 'bundle': 'sharedassets2.assets', 'match': "Icon_Earth",
     'file': 'what-a-card-shows-in-play-earth.jpg', 'note': "a third element icon the game itself prints on a card in play", 'max': 256, 'quality': 92},
    {'entity': 'what-a-card-shows-in-play', 'bundle': 'sharedassets2.assets', 'match': "Icon_Wind",
     'file': 'what-a-card-shows-in-play-wind.jpg', 'note': "a fourth element icon the game itself prints on a card in play", 'max': 256, 'quality': 92},
    {'entity': 'what-a-customer-carries', 'bundle': 'sharedassets2.assets', 'match': "T_PaperBagAlbedoClosed",
     'file': 'what-a-customer-carries-bag.jpg', 'note': "the base colour texture of the paper bag the game gives its customers, closed", 'max': 512, 'quality': 88},
    {'entity': 'what-a-customer-carries', 'bundle': 'sharedassets2.assets', 'match': "T_PaperBagAlbedoOpen",
     'file': 'what-a-customer-carries-bag-open.jpg', 'note': "the same paper bag texture in its open form", 'max': 512, 'quality': 88},
    # The crowd entry's subject is a baked bone texture, and the build does ship Female_Combined_AnimInstancing_Anim_BoneTex
    # and Male_Combined_AnimInstancing_Anim_BoneTex, but both are stored half-float and the reader cannot decode them,
    # so those two mappings were dropped rather than left as dead configuration.
    {'entity': 'the-state-of-a-game-of-cards', 'bundle': 'sharedassets2.assets', 'match': "Icon_Freeze",
     'file': 'the-state-of-a-game-of-cards-freeze.jpg', 'note': "the freeze icon the game itself draws for the frozen state its counters and element areas explode from", 'max': 256, 'quality': 92},
    # GameTitle is the card game's own logo, not the shop sim's: the art reads TETRAMON DUEL MASTER, so it belongs
    # to the entry about the card game rather than to the version entry.
    {'entity': 'the-card-game-you-can-play', 'bundle': 'sharedassets2.assets', 'match': "GameTitle",
     'file': 'the-card-game-you-can-play-logo.jpg', 'note': "the logo the game ships for the card game itself", 'max': 512, 'quality': 88},
    # The tag sheet is the artwork the price board is read off, so the entry that explains reading a
    # price board gets its own copy of it rather than borrowing another entry's file.
    {'entity': 'reading-the-price-board', 'bundle': 'sharedassets2.assets', 'match': "PriceTagAtlas",
     'file': 'reading-the-price-board-price-tag-atlas.jpg', 'note': "the sheet the game writes its price tags from, the numerals and currency signs beside a grid of item pictures", 'max': 1024, 'quality': 84},
    {'entity': 'what-a-customer-carries', 'bundle': 'sharedassets2.assets', 'match': "sactx-0-1024x1024-DXT5|BC3-Emoticons_0_19-472a18f1",
     'file': 'what-a-customer-carries-emotes.png', 'note': "the sheet of customer emotes the build ships, faces with a heart and an exclamation mark among them", 'max': 1024},
    {'entity': 'expanding-and-decorating-the-shop', 'bundle': 'sharedassets2.assets', 'match': "T_OpenCloseSign",
     'file': 'expanding-and-decorating-the-shop-open-closed-sign.png', 'note': "the sheet the game's open and closed signs are cut from", 'max': 512},
    {'entity': 'expanding-and-decorating-the-shop', 'bundle': 'sharedassets2.assets', 'match': "T_NoEntranceSign",
     'file': 'expanding-and-decorating-the-shop-no-entry-sign.png', 'note': "the sheet the entrance signs are cut from, a no-entry board and a welcome one", 'max': 512},
    {'entity': 'expanding-and-decorating-the-shop', 'bundle': 'sharedassets2.assets', 'match': "T_ArrowSign",
     'file': 'expanding-and-decorating-the-shop-arrow-signs.png', 'note': "the game's arrow-sign atlas, exit and enter boards with plain arrows", 'max': 1024},
    {'entity': 'how-the-restock-manager-packs-stock', 'bundle': 'sharedassets2.assets', 'match': "Icon_BulkBox_TetramonBase", 'type': 'Texture2D',
     'file': 'how-the-restock-manager-packs-stock-base-box.png', 'note': "the bulk supply box the game pictures for its base set", 'max': 512},
    {'entity': 'how-the-restock-manager-packs-stock', 'bundle': 'sharedassets2.assets', 'match': "Icon_BulkBox_TetramonBaseHG", 'type': 'Texture2D',
     'file': 'how-the-restock-manager-packs-stock-hg-box.png', 'note': "the same bulk box in its HG grade", 'max': 512},
    {'entity': 'how-the-restock-manager-packs-stock', 'bundle': 'sharedassets2.assets', 'match': "Icon_BulkBox_TetramonDestiny", 'type': 'Texture2D',
     'file': 'how-the-restock-manager-packs-stock-destiny-box.png', 'note': "the bulk box the game pictures for its Destiny set", 'max': 512},
    {'entity': 'licences-and-shop-level', 'bundle': 'sharedassets1.assets', 'match': "Icon_PictoIcon_Lock", 'type': 'Texture2D',
     'file': 'licences-and-shop-level-pictogram-lock.png', 'note': "the lock pictogram the game draws over content that is not unlocked yet", 'max': 256},
    {'entity': 'licences-and-shop-level', 'bundle': 'sharedassets2.assets', 'match': "Icon_ImageIcon_Lock02_Lock_btn", 'type': 'Texture2D',
     'file': 'licences-and-shop-level-button-lock.png', 'note': "the second lock the build ships for a locked button", 'max': 256},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "Icon_2_UP_CardPreserver", 'type': 'Sprite',
     'file': 'playmats-deck-boxes-and-sleeves-card-preserver.png', 'note': "the card preserver the build ships, a blister pack of rigid card holders", 'max': 512},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "T_PreconDeckWater",
     'file': 'building-and-editing-a-deck-precon-water.jpg', 'note': "the box art of the game's own preconstructed water battle deck", 'max': 1024, 'quality': 86},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "T_PreconDeckWaterDestiny",
     'file': 'building-and-editing-a-deck-precon-water-destiny.jpg', 'note': "the water deck's Destiny box art", 'max': 1024, 'quality': 86},
    {'entity': 'where-the-shops-lists-live', 'bundle': 'sharedassets2.assets', 'match': "sactx-0-1024x512-DXT5|BC3-ShelfIcon_0_7-06f5c0d7",
     'file': 'where-the-shops-lists-live-figurines.png', 'note': "one of the shelf-icon sheets the game ships, figurines and a hammer on their bases", 'max': 1024},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 62",
     'file': 'posters-and-wall-displays-poster-d.png', 'note': "a poster from the game's own set, a grinning red pig-like creature over a green field", 'max': 512},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 44",
     'file': 'posters-and-wall-displays-poster-e.png', 'note': "a poster from the game's own set, a fiery monster in flat colour on black", 'max': 512},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 30",
     'file': 'posters-and-wall-displays-poster-f.png', 'note': "a poster from the game's own set, a round white winged creature drawn in outline", 'max': 512},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 17",
     'file': 'posters-and-wall-displays-poster-g.png', 'note': "a poster from the game's own set, a booster box shown on sale", 'max': 512},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 21",
     'file': 'posters-and-wall-displays-poster-h.png', 'note': "a second poster from the game's own set, another booster box on sale", 'max': 512},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 25",
     'file': 'posters-and-wall-displays-poster-i.png', 'note': "a poster from the game's own set, a fox-like creature in flat colour", 'max': 512},
    {'entity': 'keeping-the-shop-clean', 'bundle': 'sharedassets2.assets', 'match': "Icon_Cleanser", 'type': 'Sprite',
     'file': 'keeping-the-shop-clean-cleanser.png', 'note': "the icon the game ships for its cleaner, a purple spray can", 'max': 256},
    {'entity': 'the-plants-in-and-around-the-shop', 'bundle': 'sharedassets2.assets', 'match': "Plants_AlbedoOpacity",
     'file': 'the-plants-in-and-around-the-shop-plants.png', 'note': "the sheet the game's planting is cut from, flower beds, grasses, ferns and ivy", 'max': 1024},
    {'entity': 'the-plants-in-and-around-the-shop', 'bundle': 'sharedassets2.assets', 'match': "FlowerA", 'type': 'Sprite',
     'file': 'the-plants-in-and-around-the-shop-flower.png', 'note': "a flower sprite the game ships, a cartoon bloom with yellow petals", 'max': 512},
    {'entity': 'the-figures-the-shop-sells', 'bundle': 'sharedassets2.assets', 'match': "Icon_Toy_FoxB", 'type': 'Sprite',
     'file': 'the-figures-the-shop-sells-fox.png', 'note': "the icon the game ships for one of its figures, a fox holding a purple ball", 'max': 512},
    {'entity': 'the-figures-the-shop-sells', 'bundle': 'sharedassets2.assets', 'match': "Icon_Toy_GolemB", 'type': 'Sprite',
     'file': 'the-figures-the-shop-sells-golem.png', 'note': "a second figure icon, a stone golem on a green base", 'max': 512},
    {'entity': 'how-a-card-front-is-built', 'bundle': 'sharedassets1.assets', 'match': "CardBack", 'type': 'Sprite',
     'file': 'how-a-card-front-is-built-card-back.png', 'note': "the card back the game draws, carrying the card game's own name and emblem", 'max': 512},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_8_UP_Album",
     'file': 'albums-and-binder-pages-8up.jpg', 'note': "a further album page picture the game ships, in an eight-up layout", 'max': 1024, 'quality': 84},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "Icon_Dice_Yellow",
     'file': 'playmats-deck-boxes-and-sleeves-dice-yellow.jpg', 'note': "a second dice icon the game ships for the play table", 'max': 256, 'quality': 92},
    {'entity': 'licences-and-shop-level', 'bundle': 'sharedassets2.assets', 'match': "Icon_StorePoint",
     'file': 'licences-and-shop-level-store-point.jpg', 'note': "the store-point icon the game ships for its level screens", 'max': 256, 'quality': 92},
    {'entity': 'the-camera-and-the-photo-gallery', 'bundle': 'sharedassets2.assets', 'match': "Icon_Camera",
     'file': 'the-camera-and-the-photo-gallery-camera.jpg', 'note': "the camera icon the game ships for its phone camera, opened before it was accepted", 'max': 256, 'quality': 92},
    {'entity': 'setting-up-an-event', 'bundle': 'sharedassets2.assets', 'match': "HostTournamentScreenBG",
     'file': 'setting-up-an-event-host-screen.jpg', 'note': "the game's own background for the screen where a tournament is hosted, painted with two duelling monsters", 'max': 1024, 'quality': 84},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "T_PreconDeckWind",
     'file': 'building-and-editing-a-deck-precon-wind.jpg', 'note': "the game's own box art for a preconstructed wind deck, a battle deck with a legendary card on the front", 'max': 512, 'quality': 88},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "T_PreconDeckFire",
     'file': 'building-and-editing-a-deck-precon-fire.jpg', 'note': "the game's own box art for a preconstructed fire deck", 'max': 512, 'quality': 88},
    {'entity': 'building-and-editing-a-deck', 'bundle': 'sharedassets2.assets', 'match': "T_PreconDeckEarth",
     'file': 'building-and-editing-a-deck-precon-earth.jpg', 'note': "the game's own box art for a preconstructed earth deck", 'max': 512, 'quality': 88},
    # DeluxeEditionIconsHigh turned out to be a sheet of shop fixtures in blue and green variants rather than anything
    # about the build, so the mapping was moved to the fixture entry and the file renamed.
    {'entity': 'the-setting-screens-for-your-fixtures', 'bundle': 'sharedassets2.assets', 'match': "DeluxeEditionIconsHigh",
     'file': 'the-setting-screens-for-your-fixtures-icons.jpg', 'note': "a sheet of the game's fixture icons in two colour variants", 'max': 512, 'quality': 86},
    # Rejected after opening: "BinderOptimizied_second" is almost flat olive with one blue corner shape and does not read
    # as a binder page, so the mapping was dropped rather than kept.
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "T_9_UP_TowerDeckbox",
     'file': 'playmats-deck-boxes-and-sleeves-tower-deck-box.jpg', 'note': "the game's own tower deck box texture", 'max': 512, 'quality': 88},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "CollectionIcon",
     'file': 'albums-and-binder-pages-collection.jpg', 'note': "the collection icon the game itself draws for a collection", 'max': 256, 'quality': 92},
    # Icon_512 opened as a booster pack wrapper rather than a generic icon, so it went to the pack entry instead, and
    # Icon_Egg opened as a decorated egg with no entry of its own, so that mapping was dropped.
    {'entity': 'the-pack-and-how-it-opens', 'bundle': 'sharedassets2.assets', 'match': "Icon_512",
     'file': 'the-pack-and-how-it-opens-wrapper.jpg', 'note': "the wrapper of a booster pack the game ships", 'max': 256, 'quality': 92},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_BinderBook",
     'file': 'albums-and-binder-pages-binder-book.jpg', 'note': "the game's own binder book texture", 'max': 512, 'quality': 88},
    # The sign turned out to say COUNTER CLOSED and NO CARD TRADING OR SELLING HERE, so it belongs to the counter
    # entry rather than to the fixture setting screens.
    {'entity': 'the-counter-and-money', 'bundle': 'sharedassets2.assets', 'match': "CounterClosedSign",
     'file': 'the-counter-and-money-closed-sign.jpg', 'note': "the counter sign the game ships for a closed counter", 'max': 512, 'quality': 88},
    # Rejected after opening: "EmptySign" is an almost blank white sheet, which shows a reader nothing, so the mapping
    # was dropped. The same reasoning applies to any other deliberately blank UI texture.
    # Rejected after opening: "Chairs_Chairs_AlbedoTransparency" is flat grey and black shapes that do not read as chairs,
    # so it was dropped as well.
    # Rejected after opening: "CounterMaterial_AlbedoTransparency" is grey, black and pale blue panels that do not read as
    # a counter, so the mapping was dropped as well.
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "T_DeckBox2",
     'file': 'playmats-deck-boxes-and-sleeves-deck-box-2.jpg', 'note': "a further deck box texture the game ships", 'max': 512, 'quality': 88},
    # Rejected: the fan-art assets are named "Icon_FanArt 1", "Icon_FanArt 10" and so on, and the space means the digit
    # reads as a bare number on the page, which the leak test refuses. The picture was fine; the name is not usable here.
    # Rejected after opening: "CardBoxMaterial_second" is a flat olive and green block that does not read as a card box,
    # so the mapping and file were removed rather than kept.
    {'entity': 'the-boards-interface', 'bundle': 'sharedassets2.assets', 'match': "Icon_Shield",
     'file': 'the-boards-interface-shield.jpg', 'note': "the shield icon the game itself uses on the board's health display", 'max': 128, 'quality': 92},
    {'entity': 'machines-that-work-on-their-own', 'bundle': 'sharedassets2.assets', 'match': "Icon_TurnOn",
     'file': 'machines-that-work-on-their-own-turn-on.jpg', 'note': "the on icon the game itself draws for a machine that can be switched", 'max': 256, 'quality': 92},
    {'entity': 'machines-that-work-on-their-own', 'bundle': 'sharedassets2.assets', 'match': "Icon_TurnOff",
     'file': 'machines-that-work-on-their-own-turn-off.jpg', 'note': "the off icon the game itself draws for a machine that can be switched", 'max': 256, 'quality': 92},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "ColorCardIcon_Blue",
     'file': 'the-settings-that-draw-a-card-colour.jpg', 'note': "one of the colour card icons the game itself uses for the colouring of a card", 'max': 256, 'quality': 92},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "ColorCardIcon_Red",
     'file': 'the-settings-that-draw-a-card-colour-red.jpg', 'note': "a second colour card icon from the same set", 'max': 256, 'quality': 92},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "ColorCardIcon_Green",
     'file': 'the-settings-that-draw-a-card-colour-green.jpg', 'note': "a third colour card icon from the same set", 'max': 256, 'quality': 92},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "ColorCardIcon_Yellow",
     'file': 'the-settings-that-draw-a-card-colour-yellow.jpg', 'note': "a fourth colour card icon from the same set", 'max': 256, 'quality': 92},
    {'entity': 'the-finishes-you-can-buy', 'bundle': 'sharedassets2.assets', 'match': "Icon_Wall0",
     'file': 'the-finishes-you-can-buy-wall-icon.jpg', 'note': "one of the wall finish icons the game itself uses for its shop surfaces", 'max': 512, 'quality': 88},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "Icon_Dice",
     'file': 'playmats-deck-boxes-and-sleeves-dice.jpg', 'note': "the dice icon the game itself uses on the play table", 'max': 256, 'quality': 92},
    {'entity': 'card-sets-and-expansions', 'bundle': 'sharedassets1.assets', 'match': "CardIcon_Legend",
     'file': 'card-sets-and-expansions-legend.jpg', 'note': "the legend card icon the game prints at its top rarity", 'max': 256, 'quality': 92},
    {'entity': 'what-a-cards-set-record-says', 'bundle': 'sharedassets2.assets', 'match': "CardIcon_Epic",
     'file': 'what-a-cards-set-record-says-card.jpg', 'note': "one of the card icons the game prints at a rarity, the art a set record points at", 'max': 256, 'quality': 92},
    {'entity': 'the-card-object-in-the-world', 'bundle': 'sharedassets2.assets', 'match': "CardIcon_Common",
     'file': 'the-card-object-in-the-world-card.jpg', 'note': "one of the card icons the game prints on the cards handled in the world", 'max': 256, 'quality': 92},
    {'entity': 'what-the-pack-opener-shows-you', 'bundle': 'sharedassets2.assets', 'match': "Icon_Booster",
     'file': 'what-the-pack-opener-shows-you-booster.jpg', 'note': "the booster icon the game itself uses for the packs its opener works through", 'max': 256, 'quality': 92},
    {'entity': 'the-screens-you-buy-from', 'bundle': 'sharedassets2.assets', 'match': "Icon_Checkout",
     'file': 'the-screens-you-buy-from-checkout.jpg', 'note': "the checkout icon the game itself uses across its shop screens", 'max': 256, 'quality': 92},
    {'entity': 'the-setting-screens-for-your-fixtures', 'bundle': 'sharedassets2.assets', 'match': "Icon_Ceiling0",
     'file': 'the-setting-screens-for-your-fixtures-ceiling.jpg', 'note': "one of the fixture icons the game itself uses on its setting screens", 'max': 512, 'quality': 88},
    {'entity': 'the-group-that-shows-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardIcon_Rare",
     'file': 'the-group-that-shows-a-card-rarity.jpg', 'note': "one of the rarity icons the game prints on the cards a display shows", 'max': 256, 'quality': 92},
    {'entity': 'how-the-restock-manager-packs-stock', 'bundle': 'sharedassets2.assets', 'match': "Icon_Refill",
     'file': 'how-the-restock-manager-packs-stock-refill.jpg', 'note': "the refill icon the game itself uses for the restocking its manager packs for", 'max': 256, 'quality': 92},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 3",
     'file': 'posters-and-wall-displays-poster.jpg', 'note': "one of the poster icons the game ships for wall decoration", 'max': 512, 'quality': 88},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 1",
     'file': 'posters-and-wall-displays-poster-b.jpg', 'note': "a second poster icon from the set the game ships for wall decoration", 'max': 512, 'quality': 88},
    {'entity': 'posters-and-wall-displays', 'bundle': 'sharedassets2.assets', 'match': "Icon_Poster 2",
     'file': 'posters-and-wall-displays-poster-c.jpg', 'note': "a third poster icon from the set the game ships for wall decoration", 'max': 512, 'quality': 88},
    {'entity': 'the-services-the-game-offers', 'bundle': 'sharedassets1.assets', 'match': "Icon_MenuIcon02_Shop",
     'file': 'the-services-the-game-offers-shopicon.jpg', 'note': 'the icon the game itself uses for its shop screen', 'max': 256, 'quality': 92},
    {'entity': 'customer-reviews', 'bundle': 'sharedassets2.assets', 'match': "UI_StarFill", 'file': 'customer-reviews-star.jpg', 'note': "the star the game itself uses in its rating displays", 'max': 256, 'quality': 92},
    {'entity': 'what-a-review-record-keeps', 'bundle': 'sharedassets2.assets', 'match': "UI_StarFillBG", 'file': 'what-a-review-record-keeps-star-bg.jpg', 'note': "the background image the game ships to sit under its star fill, the field the rating display is drawn on", 'max': 512, 'quality': 88},
    {'entity': 'what-the-till-shows-you', 'bundle': 'sharedassets2.assets', 'match': "credit_card_D", 'file': 'what-the-till-shows-you-card.jpg', 'note': "the card the game draws on its card payment screen", 'max': 512, 'quality': 88},
    {'entity': 'the-expansions-the-game-ships', 'bundle': 'sharedassets2.assets', 'match': "T_CardPackAscension", 'file': 'the-expansions-the-game-ships-pack.jpg', 'note': "the pack artwork the game ships for its Ascension set", 'max': 512, 'quality': 88},
    {'entity': 'the-expansions-the-game-ships', 'bundle': 'sharedassets2.assets', 'match': "Asc_35_Icon", 'file': 'the-expansions-the-game-ships-card-icon.jpg', 'note': "the game's own icon art for one card in the Ascension set", 'max': 512, 'quality': 88},
    {'entity': 'the-expansions-the-game-ships', 'bundle': 'sharedassets2.assets', 'match': "Asc_117_BG", 'file': 'the-expansions-the-game-ships-card-background.jpg', 'note': "the game's own background art for one card in the Ascension set", 'max': 512, 'quality': 88},
    {'entity': 'the-finishes-you-can-buy', 'bundle': 'sharedassets2.assets', 'match': "wall 1 blue", 'file': 'the-finishes-you-can-buy-wall-blue.jpg', 'note': "the colour texture the game ships for one of its wall finishes", 'max': 512, 'quality': 90},
    {'entity': 'the-finishes-you-can-buy', 'bundle': 'sharedassets2.assets', 'match': "wall 1 orange", 'file': 'the-finishes-you-can-buy-wall-orange.jpg', 'note': "the colour texture the game ships for another of its wall finishes", 'max': 512, 'quality': 90},
    {'entity': 'the-finishes-you-can-buy', 'bundle': 'sharedassets2.assets', 'match': "Icon_Floor0", 'file': 'the-finishes-you-can-buy-floor-icon.png', 'note': "the icon the game itself uses for a floor finish", 'max': 512},
    {'entity': 'licences-and-shop-level', 'bundle': 'sharedassets2.assets', 'match': "Icon_ImageIcon_LevelFrame1_Gray", 'file': 'licences-and-shop-level-frame.png', 'note': "the frame the game draws around the shop level in its licence screens", 'max': 364},
    {'entity': 'licences-and-shop-level', 'bundle': 'sharedassets2.assets', 'match': "LevelUp_Icon", 'file': 'licences-and-shop-level-up.png', 'note': "the icon the game uses when the shop gains a level", 'max': 128},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "Icon_EmptyPlaymat", 'file': 'playmats-deck-boxes-and-sleeves-playmat.png', 'note': "the picture the game uses for a playmat slot at the play table", 'max': 512},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "T_DeckBox", 'file': 'playmats-deck-boxes-and-sleeves-deck-box.jpg', 'note': "the colour texture the game ships for one of its deck boxes", 'max': 512, 'quality': 88},
    {'entity': 'the-settings-you-can-change', 'bundle': 'sharedassets2.assets', 'match': "SettingIcon", 'file': 'the-settings-you-can-change-icon.png', 'note': "the icon the game itself uses for its settings", 'max': 128},
    {'entity': 'the-settings-you-can-change', 'bundle': 'sharedassets2.assets', 'match': "KeyboardBtn_Spacebar", 'file': 'the-settings-you-can-change-key.png', 'note': "one of the key pictures the game uses when it shows a control binding", 'max': 256},
    {'entity': 'the-profile-behind-each-customer', 'bundle': 'sharedassets2.assets', 'match': "FemaleCustomerPic 8", 'file': 'the-profile-behind-each-customer-female.jpg', 'note': "one of the customer portraits the game ships for the customers this entry describes", 'max': 512, 'quality': 88},
    {'entity': 'the-profile-behind-each-customer', 'bundle': 'sharedassets2.assets', 'match': "MaleCustomerPic 15", 'file': 'the-profile-behind-each-customer-male.jpg', 'note': "another of the customer portraits the game ships for the customers this entry describes", 'max': 512, 'quality': 88},
    {'entity': 'how-a-shelf-holds-its-stock', 'bundle': 'sharedassets2.assets', 'match': "CardEmptySlot", 'file': 'how-a-shelf-holds-its-stock-empty.png', 'note': "the picture the game uses for an empty slot on a card shelf", 'max': 512},
    {'entity': 'how-a-shelf-holds-its-stock', 'bundle': 'sharedassets2.assets', 'match': "CardSlotFrozen", 'file': 'how-a-shelf-holds-its-stock-frozen.png', 'note': "the picture the game uses for a slot that is frozen on a card shelf", 'max': 512},
    {'entity': 'discarding-cards', 'bundle': 'sharedassets2.assets', 'match': "PO_TrashBin", 'type': 'Sprite', 'file': 'discarding-cards-bin.png', 'note': "the game's own picture of the bin cards are thrown away in", 'max': 512},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardBorder_Gold", 'file': 'the-settings-that-draw-a-card-border.jpg', 'note': "one of the border pictures the game ships for its cards", 'max': 512, 'quality': 88},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardBG_Fire", 'file': 'the-settings-that-draw-a-card-background.jpg', 'note': "one of the background pictures the game ships for its cards", 'max': 512, 'quality': 88},
    {'entity': 'how-a-price-tag-is-drawn', 'bundle': 'sharedassets2.assets', 'match': "PriceTagAtlas", 'file': 'how-a-price-tag-is-drawn-atlas.jpg', 'note': "the atlas the game draws its price tag characters from", 'max': 512, 'quality': 88},
    {'entity': 'the-money-the-counter-handles', 'bundle': 'sharedassets1.assets', 'match': "T_MoneyCoinEuro", 'file': 'the-money-the-counter-handles-euro.jpg', 'note': "one of the coin textures the game ships for a currency the counter can handle", 'max': 512, 'quality': 88},
    {'entity': 'the-money-the-counter-handles', 'bundle': 'sharedassets1.assets', 'match': "T_MoneyCoinYen", 'file': 'the-money-the-counter-handles-yen.jpg', 'note': "another of the coin textures the game ships for a currency the counter can handle", 'max': 512, 'quality': 88},
    {'entity': 'the-box-your-stock-arrives-in', 'bundle': 'sharedassets2.assets', 'match': "PackagingBox01", 'file': 'the-box-your-stock-arrives-in-packaging.jpg', 'note': "a packaging box texture the game ships for the boxes stock arrives in", 'max': 512, 'quality': 88},
    {'entity': 'the-box-your-stock-arrives-in', 'bundle': 'sharedassets2.assets', 'match': "CardboardBoxRed_20x10x7_Albedo", 'file': 'the-box-your-stock-arrives-in-cardboard.jpg', 'note': "one of the cardboard box textures the game ships, in one of its sizes", 'max': 512, 'quality': 88},
    # Names its subject outright: the game ships one price tag atlas.
    {'entity': 'price-tags-for-every-context', 'bundle': 'sharedassets2.assets', 'match': "PriceTagAtlas", 'file': 'price-tags-for-every-context-atlas.jpg', 'note': "the game's own atlas of the price tags the entry describes", 'max': 1024, 'quality': 84},
    {'entity': 'the-payment-a-customer-hands-over', 'bundle': 'sharedassets1.assets', 'match': "T_MoneyCoin", 'file': 'the-payment-a-customer-hands-over-coin.jpg', 'note': "the generic currency coin texture the game ships for the money a customer hands over", 'max': 512, 'quality': 88},
    # The pack entry names the wrapper a card comes out of and the keyboard entry names the key pictures the
    # rebinding screens draw, so both textures name their subject.
    {'entity': 'the-pack-and-how-it-opens', 'bundle': 'sharedassets2.assets', 'match': "CommonPack_GhostMegabot", 'file': 'the-pack-and-how-it-opens-packs.jpg', 'note': "the game's own sheet of pack wrappers, one per set, which is the wrapper the opening sequence turns over", 'max': 512, 'quality': 88},
    {'entity': 'the-key-binding-settings', 'bundle': 'sharedassets2.assets', 'match': "KeyboardBtn_Enter", 'file': 'the-key-binding-settings-enter.png', 'note': "one of the key pictures the game draws in its rebinding screens", 'max': 256},
    # The customer-parts entry names the people the game assembles from parts. Each portrait is a picture of
    # one of those customers, so the two below are two different customers rather than one picture reused.
    {'entity': 'why-every-customer-looks-different', 'bundle': 'sharedassets2.assets', 'match': "FemaleCustomerPic 3", 'file': 'why-every-customer-looks-different-female.jpg', 'note': "one of the customer portraits the game ships, a shopper built from the parts this entry describes", 'max': 512, 'quality': 88},
    {'entity': 'why-every-customer-looks-different', 'bundle': 'sharedassets2.assets', 'match': "MaleCustomerPic 21", 'file': 'why-every-customer-looks-different-male.jpg', 'note': "a second customer portrait, a different shopper from the same set of parts", 'max': 512, 'quality': 88},
    # The control-prompt entry names the pictures the game draws for a control. Both assets name themselves,
    # and the key picture below is a different key from the two already mapped for other entries.
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "LeftMouseClick", 'file': 'the-picture-the-game-draws-for-a-control-mouse.png', 'note': "the game's own picture of a mouse with the left button marked, drawn to show a click", 'max': 256},
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "KeyboardBtn_Ctrl", 'file': 'the-picture-the-game-draws-for-a-control-key.png', 'note': "one of the named key pictures the game ships for a binding", 'max': 256},
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "XBox_A_Fontstyle", 'file': 'the-picture-the-game-draws-for-a-control-pad-button.png', 'note': "the pad picture the game ships for its A button, a white circle with the letter on it", 'max': 256},
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "XBox_LT_Fontstyle", 'file': 'the-picture-the-game-draws-for-a-control-pad-trigger.png', 'note': "the pad picture the game ships for its left trigger, a rounded shape lettered LT", 'max': 256},
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "XBox_Dpad_Right_Fontstyle", 'file': 'the-picture-the-game-draws-for-a-control-pad-dpad.png', 'note': "the pad picture the game ships for a direction on the pad's d-pad", 'max': 256},
    # The card-display entry names the front image and the fade bars of the display, and these two assets are
    # those pieces under the names the game gives them.
    {'entity': 'the-card-display-object', 'bundle': 'sharedassets1.assets', 'match': "CardFrontFullArt_Air", 'file': 'the-card-display-object-full-art-front.jpg', 'note': "the full-art card front the display draws, one of the fronts the entry lists", 'max': 1024, 'quality': 84},
    # The shelf-manager entry describes the fixtures the game keeps lists of. The shelf texture is the shelves
    # themselves and the PO art is the game's own picture of a card storage shelf, one of those fixtures.
    {'entity': 'what-the-shelf-manager-keeps', 'bundle': 'sharedassets2.assets', 'match': "Shelves_AlbedoTransparency", 'file': 'what-the-shelf-manager-keeps-shelves.jpg', 'note': "the colour texture the game ships for its shelves, the fixture the manager lists first", 'max': 1024, 'quality': 84},
    {'entity': 'what-the-shelf-manager-keeps', 'bundle': 'sharedassets2.assets', 'match': "PO_CardStorageShelf", 'file': 'what-the-shelf-manager-keeps-card-storage.jpg', 'note': "the game's own artwork for the card storage shelf, a fixture the manager keeps a list of", 'max': 512, 'quality': 88},
    # The search entry names the card pictures a search shows; this asset is one of the game's card fronts.
    {'entity': 'the-search-that-picks-a-card', 'bundle': 'sharedassets2.assets', 'match': "AscensionCardFrontIcon", 'file': 'the-search-that-picks-a-card-front.jpg', 'note': "the game's own card front icon, one of the card pictures a search shows", 'max': 512, 'quality': 88},
    # The trade entry names the sets of customer lines the screen draws; this asset is the bubble those lines go in.
    {'entity': 'the-trade-screen-and-what-it-shows', 'bundle': 'sharedassets2.assets', 'match': "BubbleBG", 'file': 'the-trade-screen-and-what-it-shows-bubble.png', 'note': "the speech bubble background the game draws a customer's line inside", 'max': 256},
    # The card-box entry names the boxes each rarity of card comes in; both assets are those boxes.
    {'entity': 'the-boxes-cards-come-in', 'bundle': 'sharedassets2.assets', 'match': "LegendCardBox", 'file': 'the-boxes-cards-come-in-legend.jpg', 'note': "the game's own box art for its legend card box", 'max': 512, 'quality': 88},
    {'entity': 'the-boxes-cards-come-in', 'bundle': 'sharedassets2.assets', 'match': "Destiny_LegendCardBox", 'file': 'the-boxes-cards-come-in-destiny.jpg', 'note': "the legend card box the game ships for its second set", 'max': 512, 'quality': 88},
    # The rules entry names the sample card the rulebook prints; this asset is that sample card.
    {'entity': 'the-rules-of-the-card-game', 'bundle': 'sharedassets2.assets', 'match': "RulebookCardSample", 'file': 'the-rules-of-the-card-game-sample.jpg', 'note': "the sample card the game prints in its rulebook", 'max': 1024, 'quality': 84},
    # The review entry names the star fill on its screen; these two assets are the lit and unlit stars it draws.
    {'entity': 'the-review-screen', 'bundle': 'sharedassets2.assets', 'match': "Icon_ImageIcon_StarGrade_l_On", 'file': 'the-review-screen-star-on.png', 'note': "the lit star the review screen fills with", 'max': 128},
    {'entity': 'the-review-screen', 'bundle': 'sharedassets2.assets', 'match': "Icon_ImageIcon_StarGrade_l_Off", 'file': 'the-review-screen-star-off.png', 'note': "the unlit star the review screen draws beside it", 'max': 128},
    # The album entry names binder pages; the build ships more than one page picture, and these are two of them.
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_3_UP_PlatinumSeriesPocketPages", 'file': 'albums-and-binder-pages-pocket-pages.jpg', 'note': "the nine-pocket binder page the game ships", 'max': 1024, 'quality': 84},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_BinderPage_second", 'file': 'albums-and-binder-pages-second-page.jpg', 'note': "a second binder page picture the game ships", 'max': 1024, 'quality': 84},
    # The playmat entry names the sleeves and the dice the game ships; these are two of those pictures.
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "CardSleeve_second", 'file': 'playmats-deck-boxes-and-sleeves-sleeve.jpg', 'note': "the second plain sleeve design the game ships", 'max': 1024, 'quality': 84},
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "DiceBox_second", 'file': 'playmats-deck-boxes-and-sleeves-dice-box.jpg', 'note': "a dice box texture the game ships for the play table", 'max': 1024, 'quality': 84},
    # The lists entry names the lists the shop draws; this asset is the checklist icon those lists use.
    {'entity': 'where-the-shops-lists-live', 'bundle': 'sharedassets2.assets', 'match': "ChecklistIcon", 'file': 'where-the-shops-lists-live-checklist.png', 'note': "the checklist icon the game draws for its lists", 'max': 128},
    # The key-binding entry names the key pictures the rebinding screens draw; these are two more of them.
    {'entity': 'the-key-binding-settings', 'bundle': 'sharedassets1.assets', 'match': "KeyboardBtn_Shift", 'file': 'the-key-binding-settings-shift.png', 'note': "one of the named key pictures the game ships for a binding", 'max': 256},
    {'entity': 'the-key-binding-settings', 'bundle': 'sharedassets1.assets', 'match': "KeyboardBtn_Tab", 'file': 'the-key-binding-settings-tab.png', 'note': "another of the named key pictures the game ships for a binding", 'max': 256},
    # The questions page names what players ask; this asset is the question-mark icon the game draws.
    {'entity': 'questions-players-ask', 'bundle': 'sharedassets1.assets', 'match': "Icon_QuestionMark", 'file': 'questions-players-ask-question-mark.png', 'note': "the question-mark icon the game ships", 'max': 128},
    # The obtained-card page names its next and previous buttons; this asset is the arrow those buttons use.
    {'entity': 'the-page-that-shows-what-you-pulled', 'bundle': 'sharedassets2.assets', 'match': "Arrow", 'file': 'the-page-that-shows-what-you-pulled-arrow.png', 'note': "the arrow the game draws on its page buttons", 'max': 128},
    # The control-prompt entry names the plain key picture; this asset is that picture.
    {'entity': 'the-picture-the-game-draws-for-a-control', 'bundle': 'sharedassets1.assets', 'match': "KeyboardBtn", 'file': 'the-picture-the-game-draws-for-a-control-plain-key.png', 'note': "the plain key picture the game ships for a binding", 'max': 256},
    # The card-settings entry names the backgrounds a card is drawn with; the game ships one per element.
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardBG_Water", 'file': 'the-settings-that-draw-a-card-water.jpg', 'note': "the water card background the game ships", 'max': 256, 'quality': 88},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardBG_Earth", 'file': 'the-settings-that-draw-a-card-earth.jpg', 'note': "the earth card background the game ships", 'max': 256, 'quality': 88},
    # The warehouse entry names the shelf type it keeps; the game ships artwork for more than one shelf kind.
    {'entity': 'the-warehouse-and-its-shelves', 'bundle': 'sharedassets2.assets', 'match': "PO_BoxShelf", 'file': 'the-warehouse-and-its-shelves-box-shelf.jpg', 'note': "the game's own artwork for a box shelf", 'max': 512, 'quality': 88},
    {'entity': 'the-warehouse-and-its-shelves', 'bundle': 'sharedassets2.assets', 'match': "PO_CornerShelf", 'file': 'the-warehouse-and-its-shelves-corner-shelf.jpg', 'note': "the game's own artwork for a corner shelf", 'max': 512, 'quality': 88},
    # The card-settings entry names the backgrounds a card is drawn with; the game ships more of them.
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets1.assets', 'match': "CardBG_Air", 'file': 'the-settings-that-draw-a-card-air.jpg', 'note': "the air card background the game ships", 'max': 256, 'quality': 88},
    {'entity': 'the-settings-that-draw-a-card', 'bundle': 'sharedassets2.assets', 'match': "CardBG_Destiny", 'file': 'the-settings-that-draw-a-card-destiny.jpg', 'note': "the card background the game ships for its Destiny set", 'max': 512, 'quality': 88},
    # The album entry names the book its pages go in; the game ships more than one binder book picture.
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "T_BinderBookAllStar", 'file': 'albums-and-binder-pages-all-star.jpg', 'note': "the all-star binder book the game ships", 'max': 1024, 'quality': 84},
    {'entity': 'albums-and-binder-pages', 'bundle': 'sharedassets2.assets', 'match': "BinderBook_second", 'file': 'albums-and-binder-pages-book.jpg', 'note': "a second binder book picture the game ships", 'max': 1024, 'quality': 84},
    # The play-table entry names the empty playmat slot picture; the game ships one for an empty deck box too.
    {'entity': 'playmats-deck-boxes-and-sleeves', 'bundle': 'sharedassets2.assets', 'match': "Icon_EmptyDeckbox", 'file': 'playmats-deck-boxes-and-sleeves-empty-deck-box.png', 'note': "the icon the game draws for an empty deck box", 'max': 256},
    # Rejected after opening: "evotor_display_tex" turned out to be a Russian-language point-of-sale terminal screen
    # (sale, returns, goods, reports, settings), a piece of shop-fixture art rather than the price board this entry
    # describes, so the mapping was dropped instead of kept.
    # The version entry names the installed copy this site documents; this asset is the game's own title art.
    {'entity': 'which-version-this-site-documents', 'bundle': 'sharedassets0.assets', 'match': "LibraryLogo", 'file': 'which-version-this-site-documents-title.png', 'note': "the game's own title art", 'max': 1280},
  # The doors entry names the two plates the game hangs on an entrance; this asset is the sheet that carries both.
  {'entity': 'the-doors-and-the-signs-that-point-the-way', 'bundle': 'sharedassets2.assets', 'match': "T_NoEntranceSign", 'file': 'the-doors-and-the-signs-that-point-the-way-entrance-sign.png', 'note': "the sheet carrying the red no-entry plate and the green welcome plate the game hangs at an entrance", 'max': 512},
  # The achievements entry names the numbered art the game ships for its achievement set; these two are one entry's
  # icon and the background scene it is cut out of.
  {'entity': 'the-achievements-and-their-art', 'bundle': 'sharedassets2.assets', 'match': "Asc_100_Icon", 'file': 'the-achievements-and-their-art-icon.png', 'note': "the icon art for one numbered achievement, a bird-like warrior with a glowing lance", 'max': 1024},
  {'entity': 'the-achievements-and-their-art', 'bundle': 'sharedassets2.assets', 'match': "Asc_100_BG", 'file': 'the-achievements-and-their-art-background.png', 'note': "the background scene for the same achievement, the same warrior over a bright sky", 'max': 1024},
  # The clothing entry names the apparel the game ships; this asset is the cloth sheet those pieces are cut from.
  {'entity': 'the-clothes-a-shopkeeper-wears', 'bundle': 'sharedassets2.assets', 'match': "T_Cloth_D", 'file': 'the-clothes-a-shopkeeper-wears-cloth.png', 'note': "the game's own cloth sheet, a woven grey fabric", 'max': 512},
]
os.makedirs(OUT_DIR, exist_ok=True)
records = []
# Loading a bundle is by far the slowest part of this script, and mappings are grouped by bundle, so the
# loaded environment is cached per file. Reading the same bundle once per mapping made long runs exceed their time
# limit and could leave the manifest written from a partial run.
_env_cache = {}
for m in MAPPINGS:
    path = os.path.join(ROOT, m['bundle'])
    if not os.path.exists(path):
        print('  MISSING BUNDLE ' + path); continue
    if path not in _env_cache:
        _env_cache[path] = UnityPy.load(path)
    env = _env_cache[path]
    done = False
    for o in env.objects:
        # Most artwork is a Texture2D, but some of the game's icons exist only as a Sprite cut out of an atlas,
        # so an explicit mapping may ask for one.
        wanted = m.get('type', 'Texture2D')
        if o.type.name != wanted:
            continue
        try:
            d = o.read(); name = getattr(d, 'm_Name', '') or ''
        except Exception:
            continue
        if name != m['match']:
            continue
        dest = os.path.join(OUT_DIR, m['file'])
        # A few textures in this build are stored in formats the reader cannot decode (half-float bone
        # textures, for instance). A mapping that matches but cannot be written is reported and skipped so
        # the rest of the run still completes, rather than taking the whole export down with it.
        try:
            img = d.image
            # Keep the image faithful but web-sized, and record the size actually written.
            cap = m.get('max')
            if cap and max(img.size) > cap:
                scale = cap / float(max(img.size))
                img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))))
            if m['file'].lower().endswith(('.jpg', '.jpeg')):
                img.convert('RGB').save(dest, quality=m.get('quality', 85), optimize=True)
            else:
                img.save(dest)
        except Exception as exc:
            print('  SKIPPED %-41s %s' % (m['file'], exc))
            done = True; break
        raw = open(dest, 'rb').read()
        records.append({'entity': m['entity'], 'kind': 'game', 'file': 'mapped/' + m['file'], 'sourceBundle': m['bundle'],
                        'assetName': name, 'note': m['note'], 'width': img.width, 'height': img.height,
                        'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
        print('  exported %-40s %dx%d %d bytes sha256=%s' % (m['file'], img.width, img.height, len(raw), records[-1]['sha256'][:12]))
        done = True; break
    if not done:
        print('  no asset matched ' + m['match'])
json.dump({'source': ROOT, 'records': records}, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('wrote %s with %d record(s)' % (MANIFEST, len(records)))