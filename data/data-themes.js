'use strict'

const GUI_SVGS = {
	swords : 'images/swords.svg',
}
const GUI_PNGS = {
	summon : 'images/summon.png',
}

const SPELL_PNGS = {
	summonPower : 'images/spells/summonPower.png',
	summonRandom : 'images/spells/summonRandom.png',
	summonBlood : 'images/spells/summonBlood.png',
	summonFire : 'images/spells/summonFire.png',
	summonIce : 'images/spells/summonIce.png',
	summonMetal : 'images/spells/summonMetal.png',
	summonExplosion : 'images/spells/summonExplosion.png',
	summonAlignment : 'images/spells/summonAlignment.png',
}

const GUI_RESOURCE_IMAGES = "images/resources/"

const THEMES = {
	light : {
		main : {
			background : "white",
			foreground : "black",
			shades : ["#000000","#111111","#222222","#333333","#444444","#555555","#666666","#777777","#888888","#999999","#AAAAAA","#BBBBBB","#CCCCCC","#DDDDDD","#EEEEEE","#FFFFFF"],
			typeStarColors : [
				"#444444",
				"#AAAA00",
				"#00AA00",
				"#AA0000",
				"#AA6600",
				"#0066AA",
				"#666666",
			],    
			typeColors : [
				"#EEEEEE",
				"#FFFF55",
				"#ADFF2F",
				"#DC143C",
				"#FF8C00",
				"#00FFFF",
				"#BBBBBB",
			],
			enchantmentColors : [
				"#777777",
				"#999955",
				"#559999",
				"#995599",
				"#995555",
			],
			icons : {
				levelUp : "#003300"
			},
			radar : "lime",
			special : "black",
			lightning : "rgba(32,64,256,0.5)",
			magic : "rgba(0,0,0,0.1)",
			magicbg: "rgba(0,0,0,0.05)",
			mouseOwned : "green",
			mouseEnemy : "maroon",
			progress : "maroon",
			world : {
				core : "#7F7F7F",
				resource : "gold",
				imprint : "#3399FF",
				summon : "#C0FF33",
				power : "#FFFF55",
				blood : "#DC143C",
				fire : "#FF8C00",
				ice : "#00FFFF",
				metal : "#BBBBBB"
			}
		},
		boss : {
		}
	}, 	
	dark : {
		main : {
			background : "#222222",
			foreground : "#DDDDDD",
			shades : ["#DDDDDD", 
					  "#D0D0D0", 
					  "#C4C4C4", 
					  "#B7B7B7", 
					  "#ABABAB", 
					  "#9E9E9E", 
					  "#929292", 
					  "#858585", 
					  "#797979", 
					  "#6C6C6C", 
					  "#606060", 
					  "#535353", 
					  "#474747", 
					  "#3A3A3A", 
					  "#2E2E2E", 
					  "#222222"],
			typeColors : [
				"#444444",
				"#AAAA00",
				"#00AA00",
				"#AA0000",
				"#AA6600",
				"#0066AA",
				"#666666",
			],    
			typeStarColors : [
				"#EEEEEE",
				"#FFFF55",
				"#ADFF2F",
				"#DC143C",
				"#FF8C00",
				"#00FFFF",
				"#BBBBBB",
			],
			enchantmentColors : [
				"#858585",
				"#AAAA66",
				"#66AAAA",
				"#AA66AA",
				"#AA6666"
			],
			icons : {
				levelUp : "#003300"
			},
			radar : "lime",
			special : "white",
			lightning : "rgba(32,64,256,0.5)",
			magic: "rgba(0,0,0,0.3)",
			magicbg: "rgba(0,0,0,0.3)",
			mouseOwned : "green",
			mouseEnemy : "maroon",
			progress : "maroon",
			world : {
				core : "#9F9F9F",
				resource : "#9f7f2f",
				imprint : "#3399FF",
				summon : "#607F33",
				power : "#AAAA00",
				blood : "#AA0000",
				fire : "#AA6600",
				ice : "#0066AA",
				metal : "#666666"
			}
		},
		boss : {
		}
	}, 
}