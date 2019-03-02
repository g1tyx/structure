'use strict'

const gui = {
	init() {
	
		this.measureDiv = createElement("div", "utility-measure", document.body)
		
		this.dvOffline = createElement("div", "offline", document.body)
		this.dvOfflineTitle = createElement("div", "offline-title", this.dvOffline, "Processing offline progress:")
		this.dvOfflineCountdown = createElement("div", "offline-time", this.dvOffline)
		this.dvOfflineStop = createElement("div", "offline-stop", this.dvOffline, "Stop")
		this.dvOfflineStop.onclick = (event) => {
			game.stopAdvance()
		}
		
		this.mapMouse = MapMouse
		this.worldMouse = WorldMouse
		this.mainViewport = Viewport()
		this.worldViewport = Viewport()
		
		this.setTheme(settings.theme, "main")
		
		this.initImages()
		this.initSounds()

		this.tabs = TabGroup({
			name : "main"
		})
		
//		this.dvTabs = createElement("div", "tabs", document.body)
		
		this.map = this.tabs.addTab("map", "Map", MapTab)
		this.sliders = this.tabs.addTab("sliders", "Sliders", SlidersTab)
		this.skills = this.tabs.addTab("skills", "Skills", SkillsTab)
		this.management = this.tabs.addTab("management", "Management", ManagementTab)	
		
		this.stardust = this.tabs.addTab("stardust", "Stardust", StardustTab)
		this.artifacts = this.tabs.addTab("artifacts", "Artifacts", ArtifactsTab)
		this.world = this.tabs.addTab("world", "World", WorldTab)
		this.tabs.addFiller()

		this.story = this.tabs.addTab("story", "Story", StoryTab)
		this.menu = this.tabs.addTab("menu", "Menu", MenuTab)
		
			this.tabs.toggleDisplay("story", false)
		
		//Header
		this.dvHeader = createElement("div", "header", this.skills.dvDisplay)
		this.dvGold = createElement("div", "gold", this.dvHeader)
		this.dvExp = createElement("div", "exp", this.dvHeader)
		this.dvExpMult = createElement("div", "exp-mult", this.dvHeader)
		this.dvMana = createElement("div", "mana", this.dvHeader)
		this.dvScience = createElement("div", "science", this.dvHeader)
		
		this.backgroundContext = this.map.background.getContext("2d")
		this.foregroundContext = this.map.foreground.getContext("2d")
		
		this.tabs.setTab("map")

		this.target = GuiPointElement({
			className : "target", 
			parent : this.map.dvDisplay,
			
			_init() {
				this.dvDisplay.onmousemove = (event) => gui.hover.reset()
				this.dvDisplay.onclick = (event) => event.target == this.dvDisplay?this.reset():0
				
				this.pointDisplay = PointInfoDisplay({
					className : "point-info",
					parent : this.dvDisplay,
				})
				this.dvButtons = createElement("div", "buttons", this.dvDisplay)
				this.dvSliders = createElement("div", "sliders", this.dvButtons)
				this.dvSliders.onclick = (event) => event.target == this.dvSliders?this.reset():0
				
				this.dvHint = createElement("div", "target-hint", this.dvSliders, "Click to assign/free:")
				this.dvAll = createElement("div", "target-all", this.dvHint, "All")
				this.dvAll.onclick = (event) => this.targetAll(game.sliders)
				this.dvReal = createElement("div", "target-all", this.dvHint, "Real")
				this.dvReal.onclick = (event) => this.targetAll(game.sliders.filter(x => !x.clone))
				this.dvClones = createElement("div", "target-all", this.dvHint, "Clones")
				this.dvClones.onclick = (event) => this.targetAll(game.sliders.filter(x => x.clone))
				this.dvUpgrades = createElement("div", "upgrades", this.dvButtons)
				this.dvUpgrades.onclick = (event) => event.target == this.dvUpgrades?this.reset():0
				
				this.buttons = {}
				
				this.buttons.levelUp = IconButton({
					parent: this.dvUpgrades, 
					onclick: (event) => {
						if (this.point) {
							this.point.levelUp()
							this.updatePosition()
						}
					},
					available: () => (this.point.level || 0) < POINT_MAX_LEVEL && game.resources.gold >= this.point.costs.levelUp,
					visible: () => game.skills.upgradePoints && (!this.point || !this.point.boss && (!this.point.level || this.point.level < POINT_MAX_LEVEL)),
					iconText: "⇮", 
					iconColor: "#003300",
					text: () => this.point?"Level up\nGold: " + displayNumber(this.point.costs.levelUp):""
				})
				
				this.buttons.imprint = IconButton({
					parent: this.dvUpgrades, 
					onclick: (event) => {
						if (this.point) {
							this.point.startHarvest(1)
							this.updatePosition()
						}
					},
					available: () => !this.point.harvesting,
					visible: () => game.skills.imprint && this.point && this.point.canImprint && !this.point.harvested,
					iconText: "M", 
					iconColor: "#3399FF",
					text: () => this.point?this.point.harvesting?"Imprinting\n"+(100 * this.point.harvestTime / this.point.harvestTimeTotal).toFixed(3)+"% ("+shortTimeString((this.point.harvestTimeTotal - this.point.harvestTime) / game.real.harvestSpeed)+")":"Imprint ("+shortTimeString(this.point.harvestTimes[1]*(game.harvesting.size+1)/(game.world.stats.harvestSpeed))+")\nImprinting: "+game.harvesting.size:""
				})
				
				this.dvBuildings = createElement("div", "buildings", this.dvUpgrades)
				this.dvBuildings.onclick = (event) => event.target == this.dvBuildings?this.reset():0
	
				Object.values(BUILDINGS).map(x => {
					this.buttons[x.id] = IconButton({
						parent: this.dvBuildings,
						onclick: (event) => {
							if (this.point) {
								this.point.build(x.id)
								this.updateUpgrades()
							}
						},
						available: () => (this.point && this.point.costs[x.id] <= game.resources.gold),
						visible: () => game.skills["build"+x.level] && this.point && this.point.level && this.point.level >= x.level && (this.point.buildings[x.id] || this.point.costs[x.id] >= 0),
						owned: () => this.point && this.point.buildings[x.id],
						iconText: x.iconText,
						iconColor: x.iconColor,
						desc : x.desc,
						text: () => x.name + "\n" + (this.point?this.point.buildings[x.id]?x.info(this.point):"Gold: "+displayNumber(this.point.costs[x.id]):"?")
					})
				})

				this.dvSpells = createElement("div", "spells", this.dvButtons)
				this.dvSpells.onclick = (event) => event.target == this.dvSpells?this.reset():0
				
				this.spellButtons = {}

				Object.values(SPELLS).map(x => {
					if (x.type != SPELL_TYPE_POINT) return
					this.spellButtons[x.id] = IconButton({
						parent: this.dvSpells,
						onclick: (event) => {
							if (this.point) {
								this.point.cast(x.id)
							}
						},
						available: () => (this.point && this.point.manaCosts[x.id] <= game.resources.mana),
						visible: () => game.skills["book_"+x.book] && this.point && (this.point.manaCosts[x.id] >= 0),
						owned: () => false,
						iconText: x.iconText,
						iconColor: x.iconColor,
						desc : x.desc,
						text: () => this.point?x.name + "\n" + "Mana: "+displayNumber(this.point.manaCosts[x.id]):""
					})
				})

			},
			
			align(x, y) {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				if (x == -1) {
					x = parseInt(this.dvDisplay.style.left || "0")
					y = parseInt(this.dvDisplay.style.top || "0")
				} else {
					x = ((x + width + 5 < gui.mainViewport.width) ? (x + 5) : (x - 5 - width))
					y = y - height / 2
				}
				x = Math.max(1, Math.min(gui.mainViewport.width - width - 1, x))
				y = Math.max(1, Math.min(gui.mainViewport.height - height - 1, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"
			},
			
			updatePosition() {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				let x = this.dvDisplay.offsetLeft
				let y = this.dvDisplay.offsetTop
				if (!y) return
				x = Math.max(0, Math.min(gui.mainViewport.width - width, x))
				y = Math.max(0, Math.min(gui.mainViewport.height - height, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y+"px"			
			},
	
			onSet () {
				gui.mapMouse.state = MOUSE_STATE_INFO
				this.pointDisplay.set(this.point)
				
				game.sliders.map((slider, n) => {
					slider.getReal()
					slider.dvTarget.classList.toggle("notransition",true)
					this.dvSliders.appendChild(slider.dvTarget)
					slider.dvTarget.offsetWidth && slider.dvTarget.classList.toggle("notransition",false)
					slider.getReal(true)
					slider.updateTarget(this.point)
				})
				
				Object.values(this.buttons).map (x => x.dvDisplay.classList.toggle("notransition", true))
				this.updateUpgrades()
				Object.values(this.buttons).map (x => x.dvDisplay.offsetWidth && x.dvDisplay.classList.toggle("notransition", false))
			},

			targetAll(sliders) {
				let target = this.point || null
				if (!sliders.filter(x => x.target != target).length)
					target = null
				sliders.map(x => x.assignTarget(target))
			},
			
			update() {
				if (!this.point) return
				this.pointDisplay.update()

				const mode = (this.point.away == 1)?1:
							(game.skills.mining && !this.point.index)?2:
							(game.skills.upgradePoints && this.point.index)?3:
							0
				
				const displaySliders = mode == 1 || mode == 2
				this.dvAll.classList.toggle("hidden", !displaySliders || game.sliders.length < 2 || this.point && this.point.special == SPECIAL_ALONE)
				this.dvReal.classList.toggle("hidden", !displaySliders || !game.sliders.filter(x => x.clone == 1).length || this.point && this.point.special == SPECIAL_ALONE)
				this.dvClones.classList.toggle("hidden", !displaySliders || !game.sliders.filter(x => x.clone == 1).length || this.point && this.point.special == SPECIAL_ALONE)
				this.dvSliders.classList.toggle("hidden", !displaySliders)
				this.dvSpells.classList.toggle("hidden", !game.skills.spellcasting || !this.point || !(Object.values(this.point.manaCosts).filter(x => x && x > -1).length))
				
				if (this.point.harvesting == 1)
					this.buttons.imprint.update()
				
				if (displaySliders)
					game.sliders.map(slider => slider.updateTarget(this.point))
				
				this.dvUpgrades.classList.toggle("hidden", mode != 3)
				if (mode == 3) {
					Object.values(this.buttons).map(x => x.updateAvailability())
				}
				Object.values(this.spellButtons).map(x => x.updateAvailability())
			},
			
			updateUpgrades() {
				Object.values(this.buttons).map(x => x.update())
				Object.values(this.spellButtons).map(x => x.update())
			},
			
			onReset() {
				if (gui.mapMouse.state == MOUSE_STATE_INFO)
					gui.mapMouse.state = MOUSE_STATE_FREE
				game.sliders.map((slider, n) => {
					slider.dvTarget && slider.dvTarget.remove()
				})
				this.pointDisplay.reset()
			}
		})
	
		this.hover = GuiPointElement({
			className : "hover",
			parent : this.map.dvDisplay,
			
			_init() {
				this.pointDisplay = PointInfoDisplay({
					className : "point-info",
					parent : this.dvDisplay,
				})
				this.dvBuildings = createElement("div", "icons", this.dvDisplay)
				this.icons = Object.keys(BUILDINGS).map(x => BuildingIcon(x, this.dvBuildings))
			},

			align(x, y) {
				let width = this.dvDisplay.offsetWidth
				let height = this.dvDisplay.offsetHeight
				x = ((x + width + 5 < gui.mainViewport.width) ? (x + 5) : (x - 5 - width))
				y = y
				x = Math.max(0, Math.min(gui.mainViewport.width - width, x))
				y = Math.max(0, Math.min(gui.mainViewport.height - height, y))
				this.dvDisplay.style.left = x + "px"
				this.dvDisplay.style.top = y + "px"			
			},
	
			update() {
				this.pointDisplay.update()
			}, 
			
			onSet() {
				this.pointDisplay.set(this.point)
				if (this.point) {
					this.icons.map (x => {
						x.dvDisplay.classList.toggle("hidden", !(this.point.buildings && this.point.buildings[x.id] || (this.point.costs && this.point.level && this.point.level >= x.building.level && game.skills["build" + x.building.level] && this.point.costs[x.id] > -1)))
						x.dvDisplay.classList.toggle("unbought", !(this.point.buildings && this.point.buildings[x.id]))
					})
				}
			},

			onReset() {
				this.pointDisplay.reset()
			},
		})
		
		this.target.reset(true)
		this.hover.reset(true)
		this.colorPicker = ColorPicker()
	},	
	
	setTheme(theme, subtheme) {
		this.theme = Object.assign({}, THEMES.light.main)
		if (THEMES[theme] && THEMES[theme].main)
			Object.assign(this.theme,THEMES[theme].main)
		if (THEMES[theme] && THEMES[theme][subtheme])
			Object.assign(this.theme,THEMES[theme][subtheme])
//		this.theme = (THEMES[theme] || THEMES["light"])[subtheme || "main"] || THEMES.light.main
		document.body.className = theme + " " + theme + "-" + subtheme + (settings.invert?" invert":"")
		this.initImages()
		if (game && game.sliders) game.sliders.map(x => {
			x.specialPriorities.updateImages()
		})
	},

	updateTabs() {
		let distress = game.map.markers && game.map.markers.length
		//let progress = game.realMap.level > 20 && game.map.points.filter(x => x.boss && x.boss > game.map.boss).length
		this.map.dvAscend.innerText = game.map.virtual?"进化":distress?"转生(📡\uFE0E"+game.map.markers.length+")":/*progress?"Advance(⚔\uFE0E)":*/game.map.boss?"转生(⚔\uFE0E)":"转生 (🌟\uFE0E" + game.map.ascendCost + ")"
		this.map.dvAscend.classList.toggle("disabled", !!(!game.map.virtual && (distress || game.resources.stars < game.map.ascendCost && !game.map.boss || game.map.boss && game.map.points.filter(x => !x.owned && x.boss == game.map.boss).length) || game.map.virtual && !game.map.complete))
		this.map.dvAscend.classList.toggle("hidden", !!(!game.map.virtual && !game.statistics.stars || game.map.virtual && (game.map.level < 31 || (game.map.evolved && game.map.evolved >= 3) || !game.skills.evolveVirtual)))
		this.dvMana.classList.toggle("hidden", !game.skills.magic)
		this.dvScience.classList.toggle("hidden", !game.resources.science)
		this.map.dvDisplay.classList.toggle("dark", !!game.map.boss)
		this.map.dvDisplay.classList.toggle("complete", !!game.map.complete)
		this.tabs.setTitle("sliders", game.sliders.length > 1?game.sliders.length+" "+"滑块":"滑块")
		this.tabs.toggleDisplay("skills", game.realMap.level)
		this.tabs.toggleDisplay("management", game.skills.management)
		this.tabs.toggleDisplay("stardust", game.skills.stardust)
		this.tabs.toggleDisplay("artifacts", game.skills.artifacts)
		this.tabs.toggleDisplay("world", game.skills.world)
		if (game.skills.stardust) {
			const freeDust = game.resources.stardust - Object.values(game.stardust).reduce((v,x) => v+x, 0)
			gui.tabs.setTitle("stardust", (game.skills.virtualMaps?"地图 / ":"") + (freeDust?"星尘 ("+displayNumber(freeDust, 0)+")":"星尘"))
		}
//		this.tabs.toggleDisplay("magic", game.skills.magic)
	},
	
	updateSaves(target) {
		this.menu.saves.update(true, target)
	},
	
	update() {
		const activeTab = this[this.tabs.activeTab]
		
		activeTab && activeTab.update && activeTab.update()
		
		if (this.tabs.activeTab == "sliders" || this.tabs.activeTab == "skills" || this.tabs.activeTab == "management") {
			this.dvExp.innerText = "Exp: " + displayNumber(game.resources.exp) + (game.real.production.exp?(game.real.production.exp>0?" (+":" (")+displayNumber(game.real.production.exp)+"/s)":"")
			if (game.skills.magic)
				this.dvMana.innerText = "Mana: " + displayNumber(game.resources.mana) + (game.real.production.mana?(game.real.production.mana>0?" (+":" (")+displayNumber(game.real.production.mana)+"/s)":"")
			if (game.resources.science)
				this.dvScience.innerText = "Science: " + displayNumber(game.resources.science) + (game.real.production.science?(game.real.production.science>0?" (+":" (")+displayNumber(game.real.production.science)+"/s)":"")
		}
		
		if (this.tabs.activeTab == "management" || this.tabs.activeTab == "sliders")
			this.dvGold.innerText = "Gold: " + displayNumber(game.resources.gold) + (game.real.production.gold?(game.real.production.gold>0?" (+":" (")+displayNumber(game.real.production.gold)+"/s)":"")
		
		this.target.update()
		this.hover.update()
	},
	
	initImages() {
		this.images = {
			specialBorders:[]
		}

		const canvas = document.createElement("canvas")
		canvas.width = canvas.height = 60
		const c = canvas.getContext("2d")
		
		for (let i = 0; i < 16; i++) {
			c.clearRect(0, 0, 60, 60)
			c.save()
			c.globalAlpha = 0.5
			c.beginPath()
			c.strokeStyle = gui.theme.foreground
			c.fillStyle = gui.theme.foreground
			c.lineWidth = 2
			if (i == SPECIAL_RESIST) {
				c.beginPath()
				c.rect(0,0,60,60)
				c.rect(10,10,40,40)
				for (let j = 0; j < 5; j++) {
					c.moveTo(j*10, 10 - (j & 1) * 10)
					c.lineTo(j*10 + 10, (j & 1) * 10)
					c.moveTo(60 - j*10, 50 + (j & 1) * 10)
					c.lineTo(50 - j*10, 60 - (j & 1) * 10)
					c.moveTo(j*10, 10 - (j & 1) * 10)
					c.lineTo(j*10 + 10, (j & 1) * 10)
					c.moveTo(50 + (j & 1) * 10, j*10)
					c.lineTo(60 - (j & 1) * 10, 10 + j*10)
					c.moveTo(10 - (j & 1) * 10, 60 - j*10)
					c.lineTo((j & 1) * 10, 50 - j*10)
				}
				c.stroke()
			} else if (i == SPECIAL_BLOCK) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				const pi3 = Math.PI / 3
				const renderSize = 20
				const size3 = renderSize * Math.sqrt(3)
				c.moveTo(-size3 * 0.75, -renderSize * 0.75)
				c.arc(0, renderSize * 1.5, size3 * 1.5, 4 * pi3, 5 * pi3)
				c.arc(-size3 * 0.75, -renderSize * 0.75, size3 * 1.5, 0, pi3)
				c.arc(size3 * 0.75, -renderSize * 0.75, size3 * 1.5, 2 * pi3, 3 * pi3)
				c.arc(0, renderSize * 1.5, size3 * 1.5, 4 * pi3, 5 * pi3)
				c.stroke()
				c.restore()
			} else if (i == SPECIAL_NOCLONE) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				c.moveTo(20, 0)
				for (let i = 0; i < 17; i++) {
					c.lineTo((i&1?30:20) * Math.cos(i * 3.1415 / 8), (i&1?30:20) * Math.sin(i * 3.1415 / 8))
				}
				c.stroke()
				c.restore()
			} else if (i == SPECIAL_NOBUILD) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				const renderSize = 18
				c.rect(renderSize * 1.3, renderSize * 1.2, -renderSize * 2.6, -renderSize * 0.6)
				c.rect(renderSize * 1.6, renderSize * 0.6, -renderSize * 2.6, -renderSize * 0.6)
				c.rect(renderSize * 1.0, -renderSize * 0.6, -renderSize * 2.6,  renderSize * 0.6)
				c.rect(renderSize * 1.3, -renderSize * 1.2, -renderSize * 2.6,  renderSize * 0.6)
				c.moveTo(0, -renderSize * 1.2)
				c.lineTo(0, -renderSize * 0.6)
				c.moveTo(-renderSize * 0.3, 0)
				c.lineTo(-renderSize * 0.3, -renderSize * 0.6)
				c.moveTo(0, renderSize * 1.2)
				c.lineTo(0, renderSize * 0.6)
				c.moveTo(renderSize * 0.3, 0)
				c.lineTo(renderSize * 0.3, renderSize * 0.6)
				c.stroke()
				c.restore()
			} else if (i == SPECIAL_NOCHANNEL) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				const renderSize = 20
				let r = renderSize * 2.5 / Math.sqrt(3)
				c.moveTo(0, r)
				for (let i = 1; i < 7; i++) {
					c.lineTo(r * Math.sin(i/3*Math.PI), r * Math.cos(i/3*Math.PI))
				}
				r = renderSize * 2 / Math.sqrt(3)
				c.moveTo(0, r)
				for (let i = 1; i < 7; i++) {
					c.lineTo(r * Math.sin(i/3*Math.PI), r * Math.cos(i/3*Math.PI))
				}
				c.stroke()
				c.restore()
			} else if (i == SPECIAL_CLONE) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				const renderSize = 19.5
				c.moveTo(renderSize * 1.2, 0)
				for (let i = 0; i < 19; i++) {
					c.arc(0, 0, renderSize * (i&1?1.5:1.2), 2 * i * 3.1415 / 18, (2 * i+1) * 3.1415/18)
				}
				c.stroke()
				c.restore()
			} else if (i == SPECIAL_ALONE) {
				c.save()
				c.beginPath()
				c.translate(30, 30)
				const renderSize = -10
				c.moveTo(-30, -renderSize)
				c.lineTo(-renderSize, -30)
				c.moveTo(30, renderSize)
				c.lineTo(renderSize, 30)
				c.stroke()
				c.restore()
			}
			c.restore()
			this.images.specialBorders.push(canvas.toDataURL())
		}		
	},
	
	initSounds() {
		this.sounds = {}
		this.sounds.capture = new Audio("./res/capture.mp3")
	}
}
