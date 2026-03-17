# Game Specification: DERELICT PROTOCOL

**A Sci-Fi Dungeon Crawler Roguelike**

*Version 1.0 — March 16, 2026*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis](#2-market-analysis)
3. [Reference Game Analysis](#3-reference-game-analysis)
4. [Game Concept](#4-game-concept)
5. [Core Mechanics](#5-core-mechanics)
6. [Progression & Systems](#6-progression--systems)
7. [World & Setting](#7-world--setting)
8. [Art & Tone](#8-art--tone)
9. [Platform & Tech Strategy](#9-platform--tech-strategy)
10. [Monetization](#10-monetization)
11. [MVP Plan](#11-mvp-plan)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Feature Catalog](#13-feature-catalog)
14. [Sources](#14-sources)

---

## 1. Executive Summary

**Derelict Protocol** is a turn-based sci-fi roguelike dungeon crawler set aboard a procedurally generated derelict space station orbiting a desolate moon. The player is a salvager who must explore increasingly dangerous station sectors, scavenge modular equipment, manage dwindling life-support resources, and uncover why the station was abandoned — all while evading or fighting hostile automated defense systems, mutated crew remnants, and alien organisms that have infiltrated the hull.

**The market gap we're targeting:** There are very few turn-based sci-fi roguelikes set in space stations that combine immersive-sim-style environmental interaction (power grids, airlocks, atmosphere systems) with traditional roguelike depth. Jupiter Hell proved the sci-fi turn-based roguelike works but focuses on pure combat. Void Bastards showed the derelict-ship-exploration loop is compelling but was criticized for repetitiveness and shallow systems. Cogmind demonstrated that modular build-your-character-from-parts is deeply satisfying in a sci-fi context. Xenomarine tried the "Aliens on a space station" roguelike but lacked polish and scope. **No game has combined all of these strengths into a single cohesive package.**

**Target audience:** PC roguelike enthusiasts (25-40), fans of Alien/Dead Space atmosphere, players who enjoy tactical depth over twitch reflexes. Secondary: Steam Deck portable players looking for session-based games.

**Roguelike market context:** The global roguelike game market was valued at $3.2 billion in 2024 and is projected to reach $10.5 billion by 2033 (CAGR 10.5%) [[1]](#source-1). Roguelike/roguelite is among the highest median-revenue genres for indie games on Steam [[2]](#source-2). Indie games on Steam accumulated ~381 million unit sales in 2024 [[3]](#source-3). The genre is thriving but increasingly competitive — differentiation matters more than ever.

---

## 2. Market Analysis

### 2.1 Genre Health

The roguelike genre is in a period of sustained growth. Slay the Spire 2 launched to 165,000 concurrent Steam players in early 2026 [[4]](#source-4). Hades sold over 1 million copies within months of leaving Early Access [[5]](#source-5). The genre consistently produces hits at all budget levels.

### 2.2 The Sci-Fi Niche

Sci-fi roguelikes are significantly less saturated than fantasy. Community requests for space/sci-fi roguelikes are frequent on r/roguelikes, with common recommendations being limited to: Jupiter Hell, Cogmind, Approaching Infinity, Sword of the Stars: The Pit, and FTL [[6]](#source-6). Notably, when users ask for "space dungeon crawlers," recommendations often cross into non-roguelike territory (System Shock, Dead Space, Prey), indicating unmet demand.

### 2.3 The Dungeon Crawler Gap

As the developer of Cryptmaster observed: "One lesson I learned from Cryptmaster was, 'next time, make a roguelike'" — noting that roguelike mechanics dramatically increase commercial viability for indie dungeon crawlers on Steam [[7]](#source-7). The intersection of "traditional dungeon crawler" and "sci-fi roguelike" has very few entries, and even fewer with modern production values.

### 2.4 Competitive Landscape

| Game | Subgenre | Setting | Key Strength | Key Weakness |
|------|----------|---------|-------------|-------------|
| Jupiter Hell | Turn-based roguelike | Jupiter's moons | Fast tactical combat, great atmosphere | Pure combat focus, no exploration systems |
| Void Bastards | FPS roguelite | Derelict ships | Exploration risk/reward, comic art | Repetitive, shallow systems, stiff combat |
| Cogmind | Traditional roguelike | Robot facility | Modular build system, living world | Steep learning curve, niche ASCII aesthetics |
| Xenomarine | Traditional roguelike | Space station | Faithful to genre, good atmosphere | Low production values, no win condition at launch, tiny audience |
| Returnal | 3rd-person roguelite | Alien planet | AAA production, bullet-hell combat | Weak roguelike depth, minimal build variety |
| Dungeon of the Endless | Tower defense roguelike | Crashed ship | Innovative genre blend | More strategy than dungeon crawler |

---

## 3. Reference Game Analysis

### 3.1 Void Bastards (Blue Manchu, 2019)

**What works:**
- **Exploration as risk/reward:** "The most roguelike element in this game is the exploration as a risk/reward mechanic" — each ship is a tactical puzzle where you decide what to loot vs. when to flee [[8]](#source-8)
- **Ship systems as gameplay:** Power, oxygen, security, and door locks create emergent tactical situations
- **Persistent crafting progression:** Keeping weapons/tools between deaths creates forward momentum
- **Visual identity:** Cell-shaded comic book aesthetic stands out immediately
- **British dark humor:** Tone differentiates it from grimdark competitors

**What doesn't work:**
- **Repetition:** "After 10 hours, I've seen the same ships, same enemies and mostly the same gameplay with minimal change" [[9]](#source-9)
- **Shallow systems:** "Locking doors is neat but usually just a way to lock in enemies. Managing oxygen is a cool way of managing a timer but you can easily refill it" [[9]](#source-9)
- **Stiff combat:** "There is a distinct sense of clunkiness when it comes to the shooting" [[9]](#source-9)
- **Randomization vs. level design tension:** "Randomization works against the tight level design that often makes a cramped corridor shooter work so well" [[10]](#source-10)

**Key lesson for us:** The derelict-ship-exploration loop is proven and compelling, but needs **much deeper systems and more content variety** to sustain long-term engagement.

### 3.2 Jupiter Hell (ChaosForge, 2021)

**What works:**
- **Turn-based feels action-packed:** "Jupiter Hell is a thrilling turn-based roguelike" that "encourages you to play aggressively through a combination of intuitive movement and satisfying turn-based gunplay" [[11]](#source-11)
- **Short run length (~30 minutes per "moon"):** "Perfect for break!" — high replayability due to bite-sized sessions [[12]](#source-12)
- **Class/mastery system:** Three classes with distinct masteries create meaningful build variety
- **Cover system:** Positional tactics (using cover, line of sight) add depth beyond simple bump-to-attack

**What doesn't work:**
- **Sudden death frustration:** "A vast majority of my deaths is turning a corner, finding myself right in front of a group of exalt/elites, and dead" [[13]](#source-13)
- **No meta-progression:** Pure roguelike with no between-run unlocks limits casual appeal
- **Combat-only focus:** No exploration, hacking, environmental interaction, or narrative discovery

**Key lesson for us:** Turn-based combat can feel kinetic and satisfying. Cover and positioning are essential. But the game needs **more to do beyond fighting**.

### 3.3 Cogmind (Grid Sage Games, 2017-2025)

**What works:**
- **Modular self-construction:** "Attach power sources, propulsion units, utilities, and weapons" — you ARE your equipment [[14]](#source-14)
- **Living dungeon:** Robots have jobs (building, cleaning, recycling), creating a believable facility
- **Stealth as first-class strategy:** "Combat is not a way to improve yourself... making the stealth approach a much more meaningful strategy" [[15]](#source-15)
- **Reactive world AI:** Central AI that escalates responses based on your behavior
- **Multiple viable playstyles:** Tank, flier, stealth assassin, hacker — all from the same starting point
- **Sound design:** "More sound effect assets than any other roguelike" [[14]](#source-14)

**What doesn't work:**
- **Extreme learning curve:** Niche audience due to complexity
- **ASCII-first aesthetics:** Limits mainstream appeal despite optional tileset
- **10+ years of solo development:** Not a realistic scope model for a small indie

**Key lesson for us:** The modular build system and living world are the gold standard for what makes a sci-fi roguelike feel unique. We should adapt these ideas at a more accessible scope.

### 3.4 Xenomarine (Fourfold Games, 2019)

**What works:**
- **Directly addresses our niche:** "A dark, atmospheric, sci-fi/horror themed roguelike... exploring an alien-infested space station" [[16]](#source-16)
- **Wide item variety:** "Hundreds of unique items and upgradable weapons and armor"
- **Atmosphere:** "Ambient sounds, gloomy lights and other atmospheric effects perfectly weaved in game mechanics"
- **Tight budget execution:** Solo developer, $9.99 price point, 88% positive reviews

**What doesn't work:**
- **No win condition at launch:** "It goes on forever until you're dead" [[17]](#source-17)
- **Minimal player base:** Only 58 reviews total — great quality but almost zero visibility
- **Dated presentation:** Purely tile-based with minimal polish
- **No marketing:** Essentially undiscoverable

**Key lesson for us:** This is our **closest competitor** and proof the concept works — but it also shows that without production values, marketing, and a clear victory condition, even a well-designed game dies in obscurity.

### 3.5 Returnal (Housemarque, 2021)

**What works:**
- **Narrative integration with roguelike loop:** Death has diegetic meaning (time loop on alien planet)
- **Atmosphere and environmental storytelling:** "Haunting horror sci-fi Geigeresque Lovecraftian" design
- **Proves sci-fi roguelike has mass-market appeal** when production values are high

**What doesn't work (for our purposes):**
- **AAA budget, not replicable:** $70 game with massive team
- **Weak roguelike depth:** "The roguelike mechanics are the weakest part of the game" — limited build variety [[18]](#source-18)
- **Action-first design:** Real-time bullet hell, not strategic

**Key lesson for us:** Narrative integration with the roguelike loop is powerful. The *feeling* of Returnal's atmosphere (isolation, cosmic dread, mysteries that unfold across deaths) is achievable at any budget through sound, lighting, and writing.

---

## 4. Game Concept

### 4.1 Elevator Pitch

**"Cogmind meets Void Bastards on a haunted space station."** A turn-based roguelike where you scavenge modular equipment from a procedurally generated derelict station, managing power, atmosphere, and hull integrity while uncovering a cosmic horror mystery — one death at a time.

### 4.2 Core Fantasy

You are a freelance salvager who answered a distress signal from Orbital Station Kharon-7, a research platform orbiting Callisto (Jupiter's desolate moon). The station is dark, its crew is gone, and its AI defense systems have gone hostile. Something else is aboard. Your ship is damaged — you need parts from the station to repair it and escape. Each death wakes you from cryo in your docked ship, and you venture in again with whatever you previously stashed in your airlock.

### 4.3 Core Loop (Per Run)

```
PREPARE (in your docked ship)
    -> Choose loadout from stashed gear
    -> Select target sector on station map
    -> Review known intel about sector hazards

EXPLORE (aboard the station)
    -> Navigate procedurally generated rooms/corridors
    -> Manage oxygen, power cell, suit integrity
    -> Discover lore terminals, logs, environmental storytelling
    -> Encounter environmental puzzles (restore power, cycle airlocks, reroute atmosphere)

ENGAGE (tactical encounters)
    -> Turn-based combat on grid with cover system
    -> Use environment: vent atmosphere to space, overload power conduits, hack turrets
    -> Fight or avoid: defense drones, mutated crew, alien organisms, boss-class entities

EXTRACT (risk/reward decision)
    -> You can leave anytime through your docked ship
    -> The deeper/longer you stay, the more the station's AI escalates defenses
    -> Stash valuable salvage in your airlock to keep between runs
    -> Death means losing equipped gear but keeping stashed items

META-PROGRESS (between runs)
    -> Repair ship systems to unlock new capabilities
    -> Decode station logs to reveal new sectors and lore
    -> Craft permanent gear upgrades from rare materials
    -> Unlock new starting loadout options
```

### 4.4 Genre Positioning

- **Roguelike, not roguelite:** Permadeath, procedural generation, turn-based, tactical depth
- **With roguelite meta-progression:** Limited but meaningful between-run persistence (stashed gear, ship repairs, decoded intel) to lower the barrier to entry without undermining run-to-run stakes
- **Dungeon crawler structure:** Floor-based progression through station sectors with increasing difficulty
- **Immersive sim sensibilities:** Multiple solutions to problems (fight, sneak, hack, exploit environment)

---

## 5. Core Mechanics

### 5.1 Turn-Based Grid Combat

**System:** Tile-based movement on a grid. Each action (move, attack, use item, interact) costs action points (AP). Enemies act simultaneously after the player commits their turn. Inspired by Jupiter Hell's approach of making turn-based feel fast.

**Cover System:** Objects and walls provide half/full cover, reducing hit chance. Destructible cover adds tactical depth. Elevation differences (catwalks, maintenance tunnels) affect line of sight.

**Facing and Vision:** Player character has a vision cone (not 360-degree awareness). Threats outside your vision cone can ambush you. Mirrors, cameras, and motion sensors extend awareness.

**Ranged vs. Melee:** Both viable. Ranged weapons require ammo/power. Melee weapons are reliable but risky. Improvised weapons (broken pipes, severed robot arms) are common early-game.

### 5.2 Modular Equipment System

Inspired by Cogmind's component-based design but simplified for accessibility:

**Equipment Slots:**
- **Head:** Helmet/visor (vision modes, HUD overlays, atmospheric protection)
- **Torso:** Suit core (armor, life support, power capacity)
- **Arms (x2):** Weapons or tools (one per arm)
- **Back:** Utility (jetpack, shield generator, hacking rig, extra storage)
- **Legs:** Boots (movement modifiers — mag-boots for low-grav, sprint boosters)

**Key mechanic:** Equipment degrades with use and takes damage in combat. You are constantly scavenging replacements and making tradeoffs. A pristine plasma cutter might replace your battered but reliable crowbar — but it draws more suit power. This creates the emergent "build identity" that shifts within a single run.

**Crafting:** Not a full crafting system. Instead, "field modification" — combine a mod chip with equipment to add/change properties. Quick to execute, doesn't require a crafting menu minigame.

### 5.3 Station Systems Interaction

The station is not a static dungeon — it has interconnected systems the player can manipulate:

**Power Grid:**
- Rooms/sectors have power states (powered, backup, dark)
- Player can reroute power from one area to another
- Powered areas: working doors, lights, turrets (hostile), vending machines, elevators
- Dark areas: enemies have advantage, but security systems are offline

**Atmosphere:**
- Rooms track atmospheric pressure and composition
- Breached rooms vent to space (damages anything without mag-boots, clears gas)
- Player can deliberately breach airlocks to flush enemies
- Toxic gas leaks require sealed helmet or avoidance
- Fires consume oxygen in sealed rooms

**Network/Hacking:**
- Terminal access reveals map data, enemy positions, lore entries
- Hacking skill allows: turning turrets friendly, locking/unlocking doors, triggering false alarms to redirect patrols, overriding elevators
- Active hacking increases "network alert level" — station AI deploys countermeasures

**Gravity:**
- Some sectors have low or zero gravity (near the station exterior)
- Changes movement rules, projectile behavior, and enemy types
- Mag-boots prevent floating but slow movement

### 5.4 Threat Escalation (The Warden AI)

The station's damaged AI ("The Warden") acts as a dynamic difficulty system, inspired by Cogmind's central AI:

- **Alert Level (0-5):** Increases based on player actions (combat noise, hacking, destroying cameras, staying too long)
- **Level 0-1:** Roaming maintenance bots (non-hostile unless provoked), dormant turrets
- **Level 2-3:** Active security patrols, locked-down bulkheads, drone swarms
- **Level 4-5:** Hunter-killer units, station-wide lockdowns, atmospheric manipulation (The Warden vents sections)

The Warden cannot be permanently defeated — only managed. Stealth runs keep alert low. Combat runs must deal with escalating response. This creates a natural timer that discourages tedious cautious play without using an arbitrary turn counter.

### 5.5 Resource Management

Four critical resources create ongoing tension:

| Resource | Depletes From | Replenished By | Consequence of Zero |
|----------|--------------|----------------|-------------------|
| **Oxygen** | Time, breached rooms, fires | O2 canisters, atmo generators, sealed rooms | Suffocation damage per turn |
| **Power Cell** | Using powered equipment, hacking, helmet lights | Power cells, charging stations, solar panels (near windows) | Powered gear goes offline, darkness |
| **Suit Integrity** | Combat damage, environmental hazards | Repair kits, maintenance stations | Reduced armor, eventual atmospheric exposure |
| **Inventory Space** | Picking up items | Dropping/stashing items, backpack upgrades | Hard cap — must make tradeoffs |

---

## 6. Progression & Systems

### 6.1 Within-Run Progression

**No XP or levels.** Progression within a run comes entirely from equipment found/scavenged and the player's expanding knowledge of the station layout. This follows Cogmind's philosophy: "Character development does not rely on XP/grinding (which is nonexistent)" [[15]](#source-15).

**Sector Depth:** The station has 7 main sectors of increasing danger and reward, plus branching optional sectors (like Cogmind's branches or Jupiter Hell's special levels). Players can choose their path at junction points.

### 6.2 Between-Run Meta-Progression

Carefully balanced to reward investment without trivializing the core challenge:

1. **Airlock Stash (Primary):** Physical items stashed in your ship's airlock persist between runs. Limited space forces meaningful choices. This is the core meta-loop — found a great weapon? Do you use it now and risk losing it, or stash it?

2. **Ship Repairs (Milestone Unlocks):** Specific salvage components repair ship systems:
   - **Scanner Array:** Reveals sector hazard info before entry
   - **Fabricator:** Enables crafting starting gear from raw materials
   - **Comms Array:** Unlocks lore/story progression
   - **Engine Parts:** Endgame — repairing the ship IS the win condition

3. **Intel Codex (Knowledge Persistence):** Enemy types scanned are catalogued with weaknesses. Station map layout partially remembered between runs. Decoded lore terminals stay decoded.

4. **Loadout Unlocks:** Completing specific challenges (kill a boss with melee only, escape a sector without being detected) unlocks new starting loadout options.

### 6.3 Character Identity

No permanent classes. Instead, the player's "build" emerges from:
- Equipment loadout (tanky power armor vs. stealth suit vs. hacker rig)
- Trait mutations (rare, permanent buffs gained from alien exposure — risk/reward)
- Playstyle habits (the game tracks and subtly adapts to your tendencies)

---

## 7. World & Setting

### 7.1 Lore Summary

**Kharon-7** was a corporate research station in orbit around Callisto. Officially, it studied the moon's subsurface ocean. Unofficially, an expedition to Callisto's ice crust uncovered something — a structure, impossibly old, emitting a signal. The station's research division brought samples aboard. Within weeks, the crew began changing. The station AI, Warden, enacted quarantine protocols, sealing the crew inside. Then it stopped responding to corporate comms entirely.

The player, a freelance salvager, intercepted the distress signal. Their ship was damaged during approach (sabotaged docking? defense grid?). Now they're stuck, docked to a dead station, with a ship that needs parts only the station can provide.

**The truth unfolds across multiple runs.** Each death is diegetically explained (cryo revival on the player's ship, which has limited revival capacity — adding a soft "run limit" for narrative tension). Lore is discovered through audio logs, text terminals, environmental storytelling, and NPC encounters (a few surviving crew members in hiding).

### 7.2 Station Sectors

| Sector | Theme | Threats | Key Resource |
|--------|-------|---------|-------------|
| **Docking Ring** | Tutorial/hub zone | Minor maintenance bots | Basic tools, ship repair access |
| **Habitation Deck** | Crew quarters, med bay, mess hall | Mutated crew, atmospheric hazards | Medical supplies, lore-dense |
| **Engineering** | Reactors, life support, mechanical | Defense turrets, power surges | Power cells, heavy tools |
| **Research Labs** | Clean rooms, specimen storage | Alien organisms, containment failures | Advanced tech, mutation items |
| **Command Deck** | Bridge, comms, server farm | Elite security, Warden-controlled | Intel data, navigation parts |
| **External Hull** | Zero-g EVA, solar arrays, antennae | Vacuum, micro-meteorites, hull breaches | Ship repair components |
| **Sub-Level (Callisto Shaft)** | Excavation tunnels into the moon | Alien hive, the Source | Endgame lore, final boss |

### 7.3 Enemy Design Philosophy

Three enemy factions with distinct behaviors:

1. **Station Defenses (The Warden):** Turrets, patrol drones, security bots, hunter-killers. Predictable, pattern-based. Hackable. Difficulty scales with alert level.

2. **Mutated Crew:** Former humans warped by alien influence. Melee-focused, erratic movement. Some retain partial intelligence (might flee, set traps, call for help). Disturbing, not cartoonish.

3. **Alien Organisms:** Creatures from Callisto's subsurface. Unique movement (wall-crawling, phase-shifting). Resistant to conventional weapons but vulnerable to environmental kills (fire, vacuum, electricity). Late-game nightmare fuel.

---

## 8. Art & Tone

### 8.1 Visual Direction

**Target aesthetic:** "Retro-future industrial" — think Alien (1979) control rooms, not Mass Effect sleekness. CRT monitors with green phosphor text. Chunky mechanical switches. Duct-taped repairs. Condensation on cold pipes.

**Rendering approach (for indie budget):**
- **Top-down or isometric 2D** with dynamic lighting (crucial for atmosphere)
- High-quality pixel art (32x32 or 48x48 tiles) with smooth lighting/shadow system
- Particle effects for atmosphere (steam, sparks, floating debris in zero-g)
- Screen-space effects: CRT scanlines on terminals, helmet HUD overlay, red emergency lighting

**Visual reference games:** Cogmind (UI/information density), Teleglitch (top-down oppressive atmosphere), Synthetik (industrial sci-fi pixel art), Signalis (retro-future vibes).

### 8.2 Audio Direction

Sound is critical for atmosphere and gameplay — following Cogmind's philosophy that "roguelikes have a lot to gain by augmenting such an imaginative experience with proper sound design" [[14]](#source-14).

- **Ambient station sounds:** Groaning hull, distant clanking, hissing pipes, flickering lights, the low hum of life support
- **Positional audio cues:** Hear enemies before you see them (footsteps, mechanical whirring, alien chittering)
- **Dynamic music:** Ambient drones during exploration, pulsing synth during combat, silence in vacuum (with muffled suit sounds)
- **Audio-as-gameplay:** Sound propagation alerts enemies. Running is louder than walking. Gunfire echoes. Explosions attract attention.

### 8.3 Tone

- **Isolation and dread** — you are alone on a vast, dead station
- **Curiosity and discovery** — what happened here? Lore rewards exploration
- **Gallows humor** — corporate memos, absurd safety warnings, sarcastic ship AI (your ship's computer provides dry commentary, like Void Bastards' British humor but restrained)
- **NOT grimdark nihilism** — there is hope, there are survivors, escape is possible
- **Cosmic unease over jump scares** — the alien threat is strange and incomprehensible, not just "monsters go BOO"

---

## 9. Platform & Tech Strategy

### 9.1 Target Platforms

**Primary:** PC (Windows, Linux, macOS) via Steam
**Secondary:** Steam Deck verification (the game's turn-based nature is ideal for handheld)
**Future:** Nintendo Switch (post-1.0)

### 9.2 Engine

**Recommended: Godot 4.x**
- Free and open source (zero royalties)
- Strong 2D capabilities with modern lighting
- GDScript is approachable for small teams
- Growing community and plugin ecosystem
- Tilemap and shader support suits our art direction

**Alternative: Unity** if the team has existing expertise, but Godot's cost structure is superior for indie.

### 9.3 Technical Requirements

- **Minimum spec:** Any machine from the last 10 years with integrated graphics
- **Target framerate:** 60fps (turn-based, so performance is not the challenge)
- **Save system:** Save-and-quit (standard roguelike — no save-scumming, but graceful session handling for portable play)
- **Mod support (post-1.0):** Expose data files (item definitions, enemy stats, sector templates) as editable JSON/YAML

---

## 10. Monetization

### 10.1 Pricing Model

**Premium, one-time purchase:** $14.99-$19.99 at launch (Early Access), $19.99-$24.99 at 1.0.

**No microtransactions, no DLC-before-launch, no season passes.** The roguelike audience is allergic to these and will review-bomb. See: the community response pattern across every successful indie roguelike.

### 10.2 Revenue Strategy

1. **Early Access (6-12 months):** Launch with MVP feature set, iterate with community feedback. This is standard for roguelikes and the community expects it.
2. **1.0 Launch:** Major marketing push, full content, launch discount.
3. **Post-launch DLC (optional, 6+ months after 1.0):** New station sector, new enemy faction, new equipment tier. Only if the base game is complete and well-received.
4. **Platform expansion:** Switch port is an additional revenue stream. Roguelikes sell well on Switch (Hades, Dead Cells, Slay the Spire precedent).

### 10.3 Revenue Expectations (Conservative)

Based on Steam indie data analysis showing median revenue of ~$3,285 for self-published games and ~$16,222 for published games [[2]](#source-2), but roguelikes perform above median:

- **Pessimistic (1,000 units year 1):** $15,000 gross
- **Realistic (5,000-10,000 units year 1):** $75,000-$150,000 gross
- **Optimistic (25,000+ units year 1):** $375,000+ gross

Note: 84.98% of indie game revenue is concentrated in the top 10% [[2]](#source-2). Visibility and marketing execution matter enormously.

---

## 11. MVP Plan

### 11.1 MVP Scope (Target: 6 months to Early Access)

The minimum viable product must validate the core loop and be fun enough to retain Early Access players.

**MUST HAVE (MVP):**

| Feature | Description | Est. Effort |
|---------|-------------|-------------|
| Turn-based grid movement & combat | Core engine: AP system, attacks, cover, LOS | 6 weeks |
| Procedural sector generation | 3 sectors (Docking, Habitation, Engineering) with room templates + randomization | 4 weeks |
| Modular equipment system | 5 slot types, ~50 unique items with stats and degradation | 4 weeks |
| Resource management | Oxygen, power, suit integrity systems | 2 weeks |
| Station systems (basic) | Power grid on/off per room, doors, basic hacking | 3 weeks |
| Enemy AI (basic) | Patrol, chase, attack states for 2 factions (bots + mutants) | 3 weeks |
| Warden alert system | 3 alert levels with escalating spawns | 2 weeks |
| Airlock stash meta-progression | Keep items between runs via ship stash | 1 week |
| Ship repair milestones | 3 repair objectives as progression goals | 1 week |
| UI/HUD | Equipment screen, minimap, resource bars, message log | 3 weeks |
| Art (tileset + animations) | Station tileset, player, 8-10 enemy types, ~50 item sprites | 8 weeks |
| Audio (SFX + ambient) | Footsteps, combat, ambient station, 3-4 music tracks | 4 weeks |
| Lore system | Terminal text logs, basic environmental storytelling | 2 weeks |
| Tutorial | First-run guided experience in Docking Ring | 1 week |

**Estimated total:** ~24 weeks (~6 months) for a 2-3 person team working focused.

### 11.2 Early Access Roadmap

| Phase | Timeline | Content |
|-------|----------|---------|
| **EA Launch** | Month 0 | MVP: 3 sectors, 2 enemy factions, core loop |
| **EA Update 1** | Month 2 | Sectors 4-5 (Research, Command), alien faction, more items |
| **EA Update 2** | Month 4 | Sector 6 (Hull EVA), zero-g mechanics, bosses |
| **EA Update 3** | Month 6 | Sector 7 (Callisto Shaft), endgame, story completion |
| **1.0 Launch** | Month 8-10 | Polish, balance, mod support, achievements, full story |

### 11.3 MVP Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Steam reviews | 50+ reviews, >80% positive within 30 days of EA launch | Steam |
| Median play session | >45 minutes | Telemetry |
| Day-7 retention | >20% of players return within 7 days | Telemetry |
| Wishlist conversion | >15% from demo/wishlist to purchase | Steam analytics |
| Community engagement | Active Discord with >200 members by EA month 2 | Discord |

---

## 12. Risks & Mitigations

### 12.1 High-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Repetition problem** (Void Bastards' core weakness) | High | High — kills retention | Budget variety first: diverse room types, enemy behaviors, and environmental interactions. Invest in proc-gen quality over hand-crafted set pieces. |
| **Scope creep** (Cogmind took 10+ years) | High | High — never ships | Ruthless MVP scope. No feature enters dev without answering "does this make the core loop better?" |
| **Discoverability** (Xenomarine's failure mode) | High | Fatal — game dies in obscurity | Budget 20%+ of resources to marketing. Demo on Steam Next Fest. Content creator outreach. Dev blog/devlog series. |
| **Balancing turn-based pacing** | Medium | Medium — frustrating early game | Extensive playtesting. Difficulty options from day one. "Easy mode" that reduces Warden escalation. |
| **Proc-gen produces boring layouts** | Medium | High — undermines replayability | Invest in hand-designed room templates that are assembled procedurally (Cogmind's approach). Guaranteed points of interest per floor. |
| **Team burnout** | Medium | High — project dies | Realistic 6-month EA target. Visible community momentum sustains motivation. Regular milestone celebrations. |

### 12.2 What We're Deliberately NOT Doing

- **Not real-time:** Turn-based is core to our identity and dramatically reduces animation/feel requirements
- **Not multiplayer:** Co-op would double development time. Solo experience first, always.
- **Not narrative-heavy:** Environmental storytelling and text logs, not cinematics or voice acting (beyond ship AI one-liners)
- **Not attempting 3D:** 2D with excellent lighting beats mediocre 3D every time at indie budget
- **Not chasing the Hades model:** We're closer to Jupiter Hell/Cogmind in design philosophy — deep systems over flashy action

---

## 13. Feature Catalog

### Organized by Cluster with Priority Scoring

**Scoring:** Impact (1-5, engagement + differentiation potential) x Feasibility (1-5, scope/technical risk/time). **Priority = Impact + Feasibility** (max 10).

#### Core Mechanics

| Feature | Description | Examples | Confidence | Impact | Feasibility | Priority |
|---------|-------------|----------|------------|--------|-------------|----------|
| Turn-based grid combat with AP | Tile movement, attacks cost AP, enemies act after player | Jupiter Hell, Cogmind | High | 5 | 5 | 10 |
| Cover system | Half/full cover reducing hit chance, destructible | Jupiter Hell, XCOM | High | 4 | 4 | 8 |
| Modular equipment (5 slots, degradation) | Items degrade, constant scavenging/tradeoffs | Cogmind, Void Bastards | High | 5 | 4 | 9 |
| Environmental interaction (power, atmo, doors) | Manipulate station systems for tactical advantage | Void Bastards, System Shock | High | 5 | 3 | 8 |
| Vision cone and sound propagation | Directional awareness, noise alerts enemies | Cogmind, stealth games | Medium | 4 | 3 | 7 |

#### Progression & Systems

| Feature | Description | Examples | Confidence | Impact | Feasibility | Priority |
|---------|-------------|----------|------------|--------|-------------|----------|
| Airlock stash (between-run persistence) | Physical item stash on player's docked ship | Void Bastards (partial) | High | 5 | 5 | 10 |
| Ship repair milestones | Specific salvage repairs ship systems = unlocks | Original design | High | 4 | 4 | 8 |
| Intel codex (enemy/lore database) | Scanned enemies catalogued with weaknesses | Returnal, Metroid Prime | Medium | 3 | 5 | 8 |
| Warden AI alert escalation | Dynamic difficulty based on player behavior | Cogmind's central AI | High | 5 | 3 | 8 |
| Trait mutations | Permanent per-run buffs from alien exposure | Returnal parasites, Caves of Qud | Medium | 4 | 3 | 7 |

#### Art/Tone

| Feature | Description | Examples | Confidence | Impact | Feasibility | Priority |
|---------|-------------|----------|------------|--------|-------------|----------|
| Dynamic 2D lighting | Real-time shadows, flickering, darkness as mechanic | Teleglitch, Cogmind | High | 5 | 4 | 9 |
| Positional ambient audio | Environmental sound sources, audio-as-gameplay | Cogmind, Alien: Isolation | High | 5 | 3 | 8 |
| Retro-future industrial pixel art | Alien (1979) aesthetic via pixel art | Signalis, Synthetik | High | 4 | 4 | 8 |
| Helmet HUD overlay | Diegetic UI showing resources, scanner data | Dead Space, Metroid Prime | Medium | 3 | 4 | 7 |

#### Platform/Accessibility

| Feature | Description | Examples | Confidence | Impact | Feasibility | Priority |
|---------|-------------|----------|------------|--------|-------------|----------|
| Steam Deck verified | Controller support, appropriate UI scaling | Industry standard | High | 4 | 4 | 8 |
| Difficulty options | Easy/Normal/Hard affecting Warden behavior and resource availability | Jupiter Hell | High | 4 | 5 | 9 |
| Save-and-quit | Graceful session suspension | All modern roguelikes | High | 3 | 5 | 8 |
| Colorblind options | Icon shapes + patterns, not just color | Accessibility standard | Medium | 2 | 5 | 7 |

---

## 14. Sources

<a id="source-1"></a>**[1]** Data Insights Market. "Opportunities in Roguelike Game Market 2026-2034." *datainsightsmarket.com*, Feb 2026. "The global roguelike game market is poised for substantial growth, projected to expand from $3.2 billion in 2024 to reach an estimated $10.5 billion by 2033."
https://www.datainsightsmarket.com/reports/roguelike-game-1986499

<a id="source-2"></a>**[2]** Reddit /r/gamedev. "I collected data on all the AA & Indie games that made at least $500 on Steam in 2024." Feb 2025. Key findings: median revenue of $3,285 for self-published, $16,222 for published. Roguelike/Roguelite among highest median revenue genres.
https://www.reddit.com/r/gamedev/comments/1ihl3tq/

<a id="source-3"></a>**[3]** Statista. "Steam indie games annual unit sales 2024." Nov 2025. "In the first nine months of 2024, independent (indie) games accumulated 294 million unit sales on Steam with projections estimating full-year sales at 381 million units."
https://www.statista.com/statistics/1535520/steam-indie-games-annual-unit-sales/

<a id="source-4"></a>**[4]** GamesRadar+. "Move over, Slay the Spire 2 and Mewgenics." Mar 2026. Slay the Spire 2 concurrent player data.
https://www.gamesradar.com/games/roguelike/move-over-slay-the-spire-2-and-mewgenics-the-self-proclaimed-best-roguelike-in-2026-is-a-stylish-dungeon-crawler-with-94-percent-very-positive-steam-reviews-and-it-launches-into-1-0-in-april/

<a id="source-5"></a>**[5]** LEVVVEL. "How many copies did Hades sell? — 2026 statistics." Sep 2024. "Mythological roguelike Hades has sold more than 1 million copies."
https://levvvel.com/hades-statistics/

<a id="source-6"></a>**[6]** Reddit /r/roguelikes. "Any sci-fi roguelike?" Feb 2024; "Space Themed Roguelike?" Oct 2025; "Decent space roguelikes?" Sep 2023. Recurring community threads showing limited sci-fi roguelike options.
https://www.reddit.com/r/roguelikes/comments/1cw7fmt/any_scifi_roguelike/
https://www.reddit.com/r/roguelikes/comments/1off22g/space_themed_roguelike/
https://www.reddit.com/r/roguelikes/comments/16kg3p8/decent_space_roguelikes/

<a id="source-7"></a>**[7]** GamesRadar+. "'Unfortunately indie devs need to eat': Dev on bizarre-o dungeon-crawler learned 'next time, make a roguelike.'" Aug 2024.
https://www.gamesradar.com/games/unfortunately-indie-devs-need-to-eat-dev-on-bizarre-o-dungeon-crawler-learned-next-time-make-a-roguelike-since-many-players-wont-buy-new-ideas-over-safer-choices/

<a id="source-8"></a>**[8]** Steam Community Forums. "Roguelike Elements? :: Void Bastards General Discussions." Jun 2019. "The most roguelike element in this game is the exploration as a risk/reward mechanic."
https://steamcommunity.com/app/857980/discussions/0/1643164649212715084/

<a id="source-9"></a>**[9]** Reddit /r/patientgamers. "Void Bastards - a seemingly obscure and forgotten roguelike System Shock shooter." Dec 2025. Detailed community post-mortem analysis.
https://www.reddit.com/r/patientgamers/comments/1pn3fdh/

<a id="source-10"></a>**[10]** Game Revolution. "Void Bastards Review | Never tell me the odds." May 2019. "Randomization works against the tight level design that often makes a cramped corridor shooter work so well."
https://www.gamerevolution.com/review/542285-void-bastards-review-xbox-one

<a id="source-11"></a>**[11]** Rogueliker. "Great Contemporary Roguelikes & Turn-Based Rogues." Jan 2026. "Jupiter Hell encourages you to play aggressively through a combination of intuitive movement and satisfying turn-based gunplay."
https://rogueliker.com/great-roguelike-games/

<a id="source-12"></a>**[12]** Reddit /r/roguelikes. "I want you to play Jupiter Hell!" Dec 2023. Community appreciation post detailing run length and replayability.
https://www.reddit.com/r/roguelikes/comments/18t6t2q/

<a id="source-13"></a>**[13]** Reddit /r/Games. "Jupiter Hell Review: Rip and Tear At Your Own Pace." Jul 2021. Community frustration with sudden death.
https://www.reddit.com/r/Games/comments/p4avj7/

<a id="source-14"></a>**[14]** Grid Sage Games. "Genre Innovation | Cogmind." Official website. Development documentation on sound design and automation.
https://www.gridsagegames.com/cogmind/innovation.html

<a id="source-15"></a>**[15]** Grid Sage Games. "Cogmind the Roguelike." Apr 2015. "Combat is not a way to improve yourself... making the stealth approach a much more meaningful strategy."
https://www.gridsagegames.com/blog/2015/04/cogmind-roguelike/

<a id="source-16"></a>**[16]** GamingOnLinux. "Xenomarine, the hardcore, sci-fi dungeon crawling roguelike." Oct 2017.
https://www.gamingonlinux.com/articles/xenomarine-the-hardcore-sci-fi-dungeon-crawling-roguelike-releases-on-steam-this-month.10572/

<a id="source-17"></a>**[17]** Reddit /r/roguelikes. "How's Xenomarine?" Aug 2018. "So far you can't win this game; it goes on forever until you're dead."
https://www.reddit.com/r/roguelikes/comments/99ujjf/

<a id="source-18"></a>**[18]** Reddit /r/Returnal. "Is Returnal the best rogue like ever?" May 2023. "The roguelike mechanics are the weakest part of the game."
https://www.reddit.com/r/Returnal/comments/13bux26/

---

## Appendix A: 2D Implementation Guide — Making Derelict Protocol Shine in 2D

*Added March 16, 2026 — Based on analysis of 10+ successful 2D roguelikes*

This appendix translates the full game spec into concrete 2D implementation guidance, drawing lessons from the most visually and mechanically successful 2D roguelikes and roguelites. It covers reference analysis, visual strategy, 2D-specific mechanics enhancements, and concrete technical specs.

---

### A.1 2D Reference Game Analysis

#### Teleglitch (Test3 Projects, 2012) — Top-Down Sci-Fi Survival Horror Roguelike

**Directly relevant:** Same genre intersection (sci-fi, top-down, 2D, roguelike, space facility).

**What works in 2D:**
- **Line-of-sight as atmosphere:** The game blacks out everything outside the player's vision cone, creating claustrophobic tension even with simple geometry. "The subtle audio cues, shrilling enemy noises, and abstract visuals help distance Teleglitch from other games" [[A1]](#source-a1)
- **Minimalist art sells dread:** Extremely low-resolution pixel art, yet the game is praised for atmosphere. Proves that lighting, sound, and enemy behavior create horror — not fidelity.
- **Procedural room stitching:** Rooms are hand-designed blocks connected procedurally — works perfectly in 2D tile-based systems.
- **Item crafting from combinable parts:** Encourages exploration and creates item discovery surprises.

**What to avoid:**
- **TOO minimalist visually:** Critics noted "it lacks any cool detail that make you feel where you are" [[A2]](#source-a2). Teleglitch went too far in its abstraction — we need more visual storytelling in environments.
- **Gameplay too simple:** "Way, way, way too simple to be a good roguelike... you are forced to play the game in the only way you can play it" [[A2]](#source-a2). Weapon variety and build diversity must be deeper.

**Lesson:** Our floor for atmosphere. Our game should look better than Teleglitch but steal its vision-cone darkness system wholesale.

#### Caves of Qud (Freehold Games, 2015-2025) — Tile-Based Post-Apocalyptic Roguelike

**What works in 2D:**
- **Constrained color palette as identity:** Uses 16x24 pixel tiles with a maximum of 3 colors per tile from an 18-color palette [[A3]](#source-a3). The constraint becomes the aesthetic identity — immediately recognizable.
- **Art that leaves room for imagination:** "Art is abstract in a way that allows your imagination to fill in the gaps, but still concrete enough to be readable" [[A4]](#source-a4)
- **UI praised as best in class:** "I really loved the Caves of Qud UI. Plus, the gamepad support is amazing too" [[A5]](#source-a5)

**Lesson:** A tight, self-imposed color palette for our space station (cool blues, emergency reds, toxic greens, warm amber for safe areas) would create a recognizable visual identity at minimal art cost. We should invest heavily in UI/UX.

#### Cogmind (Grid Sage Games, 2017-2025) — ASCII/Tile Sci-Fi Roguelike

**What works in 2D:**
- **Particle effects on tile grid:** Explosions, projectile trails, electricity arcs — all rendered as animated tile effects. Proves you can have visceral, exciting visual feedback on a grid [[A6]](#source-a6).
- **Sound-as-visual-proxy:** Ambient sounds from environment objects change based on distance, substituting for visual detail. Smart automated inventory removes tedious tile-management overhead.
- **Hand-crafted ASCII art for every item:** Each item is visually distinct even in ASCII. With actual pixel-art tiles, this would be even more impactful.

**Lesson:** Invest in per-tile particle/animation effects. Even 2-3 frame animations on environmental objects (flickering lights, steam vents, blinking consoles) transform a static tilemap into a living space.

#### Brogue (Brian Walker, 2009-2024) — Pure ASCII Roguelike

**What works in 2D:**
- **Color and lighting as the primary visual system:** Brogue uses colored lighting that diffuses through rooms — a torch casts warm orange, water reflects blue, lava glows red. This transforms ASCII into something "gorgeous" per the community. "Brogue is also an interesting one, because while it is really simple with its tiles, there is something about it that pops" [[A4]](#source-a4).
- **Readable at a glance:** Every element is instantly identifiable by color and symbol.

**Lesson:** Dynamic per-tile color lighting is the single highest-ROI visual investment for a 2D roguelike. We must build this into the rendering pipeline from day one.

#### Shattered Pixel Dungeon (Evan Debenham, 2014-present) — Mobile Tile Roguelike

**What works in 2D:**
- **Clean 16x16/32x32 tiles with high readability** on tiny screens
- **Smooth turn animations:** Tiles shift, shake, and flash — not static
- **Inventory as a visual puzzle:** Items shown as tile icons in a grid, intuitively understandable
- **Free-to-play success story** with millions of downloads — proof tile-based roguelikes have mass appeal

**Lesson:** If we ever target mobile/Steam Deck, the tile-and-icon visual language of Pixel Dungeon is the gold standard for handheld readability.

#### Dungeon of the Endless (Amplitude Studios, 2014) — Sci-Fi 2D Roguelike/Tower Defense

**What works in 2D:**
- **Room-by-room fog of war:** Rooms are dark until powered — mechanically AND visually brilliant for a space station setting. "The dark and gritty sci-fi theme and grizzled pixel art aesthetic make for a grounded, intense experience" [[A7]](#source-a7)
- **Lighting tied to game mechanics:** Powered rooms are lit and safe; unpowered rooms are dark and spawn enemies. Our power-grid system maps perfectly to this visual paradigm.
- **Team-based 2D with character portraits:** Proves that 2D sci-fi roguelikes can have strong character personality through portraits, dialogue, and unique abilities even without 3D models.

**Lesson:** Our power-grid mechanic should be visible — lit rooms vs. dark rooms is the core visual rhythm of the game. This is thematically perfect for a derelict space station.

---

### A.2 2D Visual Specification

#### A.2.1 Perspective & Tile Size

| Property | Specification | Rationale |
|----------|--------------|-----------|
| **Perspective** | Top-down orthographic (no isometric) | Simplest to implement, best for grid-based movement, aligns with Cogmind/DCSS/Teleglitch tradition |
| **Tile size** | 32x32 pixels (gameplay tiles) | Sweet spot: large enough for detail and readability on 1080p+, small enough for dense map display. 16x16 is too small for the detail we want; 48x48 limits viewport size |
| **Display grid** | ~25x17 visible tiles at 1080p (800x544 play area + UI panels) | Enough visible area for tactical planning; leaves room for equipment/resource UI panels |
| **Zoom** | 2 zoom levels (normal + zoomed-out strategic view at 16x16) | Zoomed-out view for route planning; normal view for combat/exploration |

#### A.2.2 Color Palette Strategy

Inspired by Caves of Qud's restricted palette, but themed for a space station:

| Color Role | Hex Range | Usage |
|------------|-----------|-------|
| **Station Hull (base)** | Dark grays, gunmetal blues (#1a1a2e, #2d3436) | Walls, floors, structural elements |
| **Powered/Safe** | Warm amber, soft white (#f0a500, #dfe6e9) | Lit rooms, active consoles, safe zones |
| **Unpowered/Danger** | Deep navy, black (#0a0a1a, #000000) | Dark rooms, unknown areas |
| **Emergency** | Warning red, orange (#e74c3c, #e67e22) | Alarms, fire, hull breach indicators, enemy alert |
| **Toxic/Alien** | Acid green, bioluminescent cyan (#00b894, #00cec9) | Alien organisms, contaminated areas, mutations |
| **Player/UI Highlight** | Bright white, electric blue (#ffffff, #74b9ff) | Player character, selected items, UI focus |
| **Lore/Interactive** | Soft gold, terminal green (#fdcb6e, #55efc4) | Readable terminals, interactable objects |

**Key principle:** Room lighting tint changes based on power state, atmospheric status, and alert level. A powered room is warm amber; the same room in an emergency is bathed in red; unpowered is near-black with only the player's torch visible. This single system creates massive visual variety from the same tile assets.

#### A.2.3 Layered Rendering Pipeline

```
Layer 0: FLOOR TILES (static per room — metal plating, grating, carpet, rubble)
Layer 1: WALL/STRUCTURE TILES (static — hull walls, doors, windows, consoles)
Layer 2: OBJECT TILES (semi-static — crates, terminals, furniture, items on ground)
Layer 3: ENTITY TILES (animated — player, enemies, NPCs, drones)
Layer 4: PARTICLE/FX (animated — sparks, steam, blood, projectile trails, explosions)
Layer 5: LIGHTING OVERLAY (dynamic — per-tile color tint, shadows, vision cone mask)
Layer 6: UI/HUD OVERLAY (fixed — resource bars, minimap, message log, helmet HUD)
```

**Layer 5 (Lighting) is the most critical layer.** It transforms flat tiles into atmospheric scenes. Implementation:
- Each tile stores a light color + intensity value
- Light sources (room lights, player torch, fires, explosions, alien glow) radiate outward with falloff
- Vision cone mask blacks out tiles the player can't see (Teleglitch-style)
- "Memory" tiles: previously-seen-but-not-currently-visible tiles render at 30% brightness in desaturated gray

#### A.2.4 Animation Budget

For a 2D tile game, animation is critical but must be budget-conscious:

| Element | Animation Type | Frames | Priority |
|---------|---------------|--------|----------|
| **Player character** | 4-direction walk cycle, attack, hurt, interact | 4-6 frames per action | Must-have |
| **Enemies (per type)** | Idle pulse, move, attack, death | 3-4 frames per action | Must-have |
| **Environmental** | Flickering lights, steam vents, sparking wires, spinning fans, blinking consoles | 2-3 frame loops | High — biggest atmosphere bang |
| **Combat FX** | Muzzle flash, bullet trail, melee slash, explosion, electricity arc | 3-5 frames, particle-based | Must-have |
| **UI transitions** | Item pickup swoosh, damage flash (red screen edge), alert level change | Tween-based (no sprites needed) | Medium |
| **Atmospheric particles** | Floating dust, drifting debris (zero-g), smoke wisps | GPU particles or simple sprite emitters | Medium |

**Total estimated sprite count for MVP:** ~400-600 unique sprites (including all animation frames). This is achievable for a single pixel artist over 6-8 weeks at 32x32 resolution.

---

### A.3 2D-Specific Mechanics Enhancements

These mechanics work especially well in 2D and should be prioritized:

#### A.3.1 Vision Cone & Darkness System

Directly from Teleglitch, adapted for turn-based:

- **Player has 90-degree front-facing vision cone** (can be widened by helmet upgrades)
- **Everything outside the cone is fully black** (not just fog-of-war gray — BLACK)
- **Hearing radius extends beyond vision:** Sound indicators (directional pips on screen edge) show approximate enemy positions outside vision cone
- **Light sources illuminate regardless of facing:** A room with working lights is fully visible; a dark room only shows what's in your cone + torch range
- **Helmet flashlight:** Default cone light source. Can be upgraded to wide-beam, IR (see through walls briefly), or UV (reveal alien trails)

This is THE signature visual mechanic. It makes every corridor turn terrifying and every room entry a tactical decision.

#### A.3.2 Room-State Visualization

Each room visually reflects its system state — the player sees this at a glance:

| Room State | Visual Treatment |
|------------|-----------------|
| **Powered + Safe** | Warm lighting, active console glow, steady ambient hum |
| **Powered + Alerted** | Red emergency lighting, klaxon flash, locked door indicators |
| **Unpowered** | Near-black except player torch/flashlight, dead console screens, silence |
| **Breached (vacuum)** | Tiles frost over at edges, debris floats (zero-g particles), blue-white cold tint |
| **Toxic atmosphere** | Green-yellow haze overlay, bubbling floor vents, toxic gas particles |
| **On fire** | Orange-red flickering, fire particles consuming objects, smoke rising |
| **Alien-infested** | Bioluminescent organic growths on walls (green/cyan), pulsing veins on floor tiles |

This system means the **same room template looks dramatically different** depending on what's happened to it — directly addressing the Void Bastards repetition problem through visual variety at zero additional room-design cost.

#### A.3.3 Environmental Destruction & Traces

2D makes it easy to render persistent changes to the environment:

- **Bullet holes / scorch marks** remain on walls after combat (decal sprites layered on tiles)
- **Blood / fluid trails** from wounded enemies create trackable paths
- **Broken objects** leave rubble sprites that affect movement (half-cover, difficult terrain)
- **Player footprints in dust/frost** reveal where you've been (useful for navigation, dangerous if enemies track you)
- **Door states visible:** Open, closed, locked (red light), jammed (sparking), destroyed (broken frame)

#### A.3.4 Map & Minimap System

Turn-based 2D games live or die by their map:

- **Auto-map** reveals as player explores (standard roguelike)
- **Full-screen map mode** with annotations: mark rooms as "dangerous," "looted," "has power terminal"
- **Sector overview** shows known room connections, power grid status, atmosphere warnings
- **Data-from-hacking overlay:** Hacked terminals reveal enemy positions, item locations, and system states on the minimap for a limited number of turns

#### A.3.5 UI Layout for 2D (Reference: Cogmind + Caves of Qud)

```
+--------------------------------------------------+
|  [Equipment Slots - visual paper doll]  | [Mini-  |
|  Head: [helmet icon]                    |  map]   |
|  L.Arm: [weapon icon]                   |         |
|  R.Arm: [tool icon]                     |         |
|  Torso: [suit icon]                     |         |
|  Back:  [utility icon]                  |         |
|  Legs:  [boots icon]                    |         |
|  ---------------------------------      |         |
|  O2: [====----] 58%                     |         |
|  PWR:[=======--] 82%                    |         |
|  SUIT:[==------] 31%                    |         |
|  ALERT: [**---] LVL 2                  |         |
+--------------------------------------------------+
|                                                    |
|              MAIN GAME VIEWPORT                    |
|              (25x17 tile grid)                     |
|                                                    |
+--------------------------------------------------+
| [Message Log - scrollable, color-coded by type]    |
| > You hear metallic footsteps to the east.         |
| > The security drone spots you! Alert +1           |
| > You fire the plasma cutter. Hit! 23 dmg.         |
+--------------------------------------------------+
```

This layout provides:
- **Persistent equipment/resource visibility** (no menu diving during combat)
- **Minimap always visible** (critical for spatial awareness in turn-based)
- **Message log for narrative/tactical info** (roguelike tradition, carries lore delivery)
- **Maximum viewport space** for the actual game

---

### A.4 2D-Specific Technical Specs

#### A.4.1 Godot 4.x Implementation Notes

| System | Godot Approach | Notes |
|--------|---------------|-------|
| **Tilemap** | `TileMapLayer` nodes (Godot 4.x multi-layer tilemap) | One layer per rendering layer; physics on wall layer |
| **Lighting** | `PointLight2D` + `CanvasModulate` for global darkness | Light sources are `PointLight2D` nodes attached to entities/objects; `LightOccluder2D` on walls for shadows |
| **Vision cone** | Custom shader on Layer 5 or `Light2D` with cone texture | Rotate with player facing direction; enemies outside cone get visibility check |
| **Particles** | `GPUParticles2D` for steam, sparks, debris, fire | Low-cost on modern hardware; add enormous visual value |
| **FOW/Memory** | Shader-based: fully black (unseen), tinted gray (remembered), full color (visible) | Store seen-tile data in a 2D array; shader reads this + current LOS |
| **Camera** | `Camera2D` with smooth follow + screen shake on explosions | Subtle camera shake is essential for combat feel |
| **Audio** | `AudioStreamPlayer2D` with attenuation on sound sources | Positional audio is critical — Godot handles this natively |
| **Proc-gen** | GDScript or C# room-template stitcher | Pre-designed room templates (scenes) assembled by the generator; connections validated for hull integrity |

#### A.4.2 Target Resolution & Scaling

| Resolution | Tile Display | UI Scale |
|------------|-------------|----------|
| **1920x1080 (native target)** | 32x32 tiles, 25x17 visible grid | 1x |
| **2560x1440** | 32x32 tiles, 33x22 visible grid (more visible area) | 1.25x UI |
| **1280x720 (Steam Deck)** | 32x32 tiles, 16x11 visible grid OR 24x24 tiles at 21x15 | Auto-scale UI to fit |
| **3840x2160 (4K)** | 64x64 upscaled (pixel-perfect 2x) | 2x UI |

Use Godot's `stretch_mode = canvas_items` with `stretch_aspect = keep` for clean pixel scaling.

---

### A.5 What 2D Adds That 3D Can't (Easily)

These are genuine advantages of 2D for THIS specific game:

1. **Information density.** Turn-based roguelikes need the player to see 15-25 tiles in every direction. 2D top-down achieves this natively; 3D requires camera compromises.

2. **Instant readability.** Every enemy, item, and hazard is a distinct colored sprite on the grid. No "what is that in the dark corner" 3D rendering ambiguity.

3. **Proc-gen is easier and more reliable.** 2D room templates are trivially composable. 3D proc-gen requires dealing with navmeshes, camera clipping, z-fighting, and visual coherence — all budget sinks.

4. **Art production speed.** A 32x32 sprite takes 15-60 minutes. A 3D model with textures and animations takes 4-40 hours. For 50+ enemy types and 200+ items, 2D is the only realistic choice for a small team.

5. **Mod-friendliness.** Players can create new tiles, items, and room templates with a pixel editor. This community content pipeline is a proven long-tail revenue driver (see: CDDA, Dwarf Fortress tilesets, Shattered Pixel Dungeon mods).

6. **Dynamic lighting sells the setting.** A dark space station with flickering emergency lights, torch beams cutting through blackness, and alien bioluminescence is MORE atmospheric in stylized 2D than in budget 3D. Teleglitch proved this with graphics that were barely above prototype quality — and got a 9/10 from Eurogamer purely on atmosphere [[A8]](#source-a8).

---

### A.6 Additional 2D Sources

<a id="source-a1"></a>**[A1]** Glitchwave. "Teleglitch reviews & ratings." "The subtle audio cues, shrilling enemy noises, and abstract visuals help distance Teleglitch from other games."
https://glitchwave.com/game/teleglitch/

<a id="source-a2"></a>**[A2]** Reddit /r/patientgamers. "Teleglitch (2013) is one of the best roguelikes I've ever played." Jul 2020. Includes critical counterpoint on atmosphere and gameplay simplicity.
https://www.reddit.com/r/patientgamers/comments/hwo5nk/

<a id="source-a3"></a>**[A3]** Caves of Qud Wiki. "Visual Style." "Each tile is 16 pixels wide by 24 pixels tall and may contain up to three of the game's 18 fixed colors."
https://wiki.cavesofqud.com/wiki/Visual_Style

<a id="source-a4"></a>**[A4]** Reddit /r/roguelikes. "Which 2D roguelike has the most compelling aesthetic and why?" Sep 2024. Top answer: "Caves of Qud... art is abstract in a way that allows your imagination to fill in the gaps."
https://www.reddit.com/r/roguelikes/comments/1f9guid/

<a id="source-a5"></a>**[A5]** Reddit /r/roguelikes. "Best Roguelike UI." May 2025. Top answers: Caves of Qud, Cogmind, Brogue.
https://www.reddit.com/r/roguelikes/comments/1kmodn6/

<a id="source-a6"></a>**[A6]** Grid Sage Games. "Genre Innovation | Cogmind." Detailed documentation of particle effects, sound propagation, and automated inventory on tile grids.
https://www.gridsagegames.com/cogmind/innovation.html

<a id="source-a7"></a>**[A7]** Game Rant. "Best Roguelike Dungeon-Crawlers." Oct 2024. "The dark and gritty sci-fi theme and grizzled pixel art aesthetic make for a grounded, intense experience."
https://gamerant.com/best-roguelike-dungeon-crawlers/

<a id="source-a8"></a>**[A8]** Eurogamer. "Teleglitch review." 9/10. "Tense and atmospheric, Teleglitch wields difficulty, action and horror to create an unsettling survival experience."
https://www.eurogamer.net/teleglitch-review

---

*Document prepared by the game-ideation-researcher. Research conducted March 16, 2026.*
*All market data and quotes are cited inline. Speculative or low-confidence items are flagged in the Feature Catalog.*
