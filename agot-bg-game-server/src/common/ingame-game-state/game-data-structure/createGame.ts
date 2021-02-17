import * as baseGameData from "../../../../data/baseGameData.json";
import HouseCard from "./house-card/HouseCard";
import House from "./House";
import Region from "./Region";
import World from "./World";
import WesterosCard from "./westeros-card/WesterosCard";
import {westerosCardTypes} from "./westeros-card/westerosCardTypes";
import unitTypes from "./unitTypes";
import Game from "./Game";
import WildlingCard from "./wildling-card/WildlingCard";
import wildlingCardTypes from "./wildling-card/wildlingCardTypes";
import BetterMap from "../../../utils/BetterMap";
import * as _ from "lodash";
import houseCardAbilities from "./house-card/houseCardAbilities";
import EntireGame from "../../EntireGame";
import staticWorld from "./static-data-structure/globalStaticWorld";

const MAX_POWER_TOKENS = 20;

interface HouseCardContainer {
    houseCards: {[key: string]: HouseCardData};
}

interface HouseData {
    name: string;
    color: string;
    unitLimits: {[key: string]: number};
    houseCards: {[key: string]: HouseCardData};
    supplyLevel: number;
}

interface UnitData {
    unitType: string;
    house: string;
    quantity: number;
}

interface HouseCardData {
    name: string;
    combatStrength?: number;
    swordIcons?: number;
    towerIcons?: number;
    ability?: string;
}

export interface GameSetupContainer {
    name: string;
    playerSetups: GameSetup[];
}

export interface GameSetup {
    playerCount: number;
    houses: string[];
    blockedRegions?: string[];
    removedUnits?: string[];
    tracks?: { ironThrone?: string[]; fiefdoms?: string[]; kingsCourt?: string[] };
    houseCards?: {[key: string]: HouseCardContainer};
    units?: {[key: string]: UnitData[]};
    structuresCountNeededToWin?: number;
    maxTurn?: number;
    supplyLevels?: {[key: string]: number};
    powerTokensOnBoard?: {[key: string]: string[]};
    garrisons?: {[key: string]: number};
}

export default function createGame(entireGame: EntireGame, housesToCreate: string[]): Game {
    const gameSettings = entireGame.gameSettings;

    const game = new Game();

    const baseGameHousesToCreate = new BetterMap(
        Object.entries(baseGameData.houses as {[key: string]: HouseData})
        .filter(([hid, _]) => housesToCreate.includes(hid)));

    // Overwrite house cards
    if (entireGame.selectedGameSetup.houseCards) {
        const newHouseCards = new BetterMap(
            Object.entries(entireGame.selectedGameSetup.houseCards)
            .filter(([hid, _]) => housesToCreate.includes(hid)));

        newHouseCards.keys.forEach(hid => {
           const newHouseData = baseGameHousesToCreate.get(hid);
           newHouseData.houseCards = newHouseCards.get(hid).houseCards;
           baseGameHousesToCreate.set(hid, newHouseData);
        });
    } else if (gameSettings.adwdHouseCards) {
        const adwdHouseCards = entireGame.allGameSetups.get("a-dance-with-dragons").playerSetups[0].houseCards as {[key: string]: HouseCardContainer};
        const newHouseCards = new BetterMap(
            Object.entries(adwdHouseCards)
            .filter(([hid, _]) => housesToCreate.includes(hid)));

        newHouseCards.keys.forEach(hid => {
           const newHouseData = baseGameHousesToCreate.get(hid);
           newHouseData.houseCards = newHouseCards.get(hid).houseCards;
           baseGameHousesToCreate.set(hid, newHouseData);
        });
    }

    // Overwrite supply levels
    if (entireGame.selectedGameSetup.supplyLevels) {
        Object.entries(entireGame.selectedGameSetup.supplyLevels)
            .filter(([hid, _]) => housesToCreate.includes(hid))
            .forEach(([hid, level]) => {
                const newHouseData = baseGameHousesToCreate.get(hid);
                newHouseData.supplyLevel = level;
                baseGameHousesToCreate.set(hid, newHouseData);
        });
    }

    game.houses = new BetterMap(
        baseGameHousesToCreate.entries
        .map(([hid, houseData]) => {
            const houseCards = new BetterMap<string, HouseCard>(
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore The conversion provokes n error in the CI
                // Don't ask me why.

                Object.entries(houseData.houseCards)
                    .map(([houseCardId, houseCardData]) => {
                        const houseCard = new HouseCard(
                            houseCardId,
                            houseCardData.name,
                            houseCardData.combatStrength ? houseCardData.combatStrength : 0,
                            houseCardData.swordIcons ? houseCardData.swordIcons : 0,
                            houseCardData.towerIcons ? houseCardData.towerIcons : 0,
                            houseCardData.ability ? houseCardAbilities.get(houseCardData.ability) : null
                        );

                        return [houseCardId, houseCard];
                    })
            );

            const unitLimits = new BetterMap(
                Object.entries(houseData.unitLimits as {[key: string]: number})
                    .map(([unitTypeId, limit]) => [unitTypes.get(unitTypeId), limit])
            );

            const house = new House(hid, houseData.name, houseData.color, houseCards, unitLimits, 5, houseData.supplyLevel);

            return [hid, house];
        })
    );

    game.maxTurns = entireGame.selectedGameSetup.maxTurn ? entireGame.selectedGameSetup.maxTurn : baseGameData.maxTurns;
    game.structuresCountNeededToWin = entireGame.selectedGameSetup.structuresCountNeededToWin ? entireGame.selectedGameSetup.structuresCountNeededToWin : baseGameData.structuresCountNeededToWin;
    game.supplyRestrictions = baseGameData.supplyRestrictions;
    game.maxPowerTokens = MAX_POWER_TOKENS;
    game.revealedWesterosCards = gameSettings.cokWesterosPhase ? 3 : 0;

    // Load tracks starting positions
    if (entireGame.selectedGameSetup.tracks && entireGame.selectedGameSetup.tracks.ironThrone) {
        game.ironThroneTrack = entireGame.selectedGameSetup.tracks.ironThrone.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    } else {
        game.ironThroneTrack = baseGameData.tracks.ironThrone.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    }

    if (entireGame.selectedGameSetup.tracks && entireGame.selectedGameSetup.tracks.fiefdoms) {
        game.fiefdomsTrack = entireGame.selectedGameSetup.tracks.fiefdoms.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    } else {
        game.fiefdomsTrack = baseGameData.tracks.fiefdoms.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    }

    if (entireGame.selectedGameSetup.tracks && entireGame.selectedGameSetup.tracks.kingsCourt) {
        game.kingsCourtTrack = entireGame.selectedGameSetup.tracks.kingsCourt.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    } else {
        game.kingsCourtTrack = baseGameData.tracks.kingsCourt.filter(hid => housesToCreate.includes(hid)).map(hid => game.houses.get(hid));
    }

    // Loading Tiled map
    const regions = new BetterMap(staticWorld.staticRegions.values.map(staticRegion => {
        const blocked = entireGame.selectedGameSetup.blockedRegions ? entireGame.selectedGameSetup.blockedRegions.includes(staticRegion.id) : false;

        return [
            staticRegion.id,
            new Region(
                game,
                staticRegion.id,
                blocked ? 1000 : staticRegion.startingGarrison
            )
        ];
    }));

    game.world = new World(regions);

    // Load Westeros Cards
    game.westerosDecks = baseGameData.westerosCards.map(westerosDeckData => {
        let lastId = 0;

        const cards: WesterosCard[] = [];
        westerosDeckData.forEach(westerosCardData => {
            const westerosCardType = westerosCardTypes.get(westerosCardData.type);
            const quantity = westerosCardData.quantity ? westerosCardData.quantity : 1;
            for (let i = 0;i < quantity;i++) {
                const id = ++lastId;

                cards.push(new WesterosCard(id, westerosCardType));
            }
        });

        return _.shuffle(cards);
    });

    // Load Wildling deck
    let lastId = 0;
    game.wildlingDeck = baseGameData.wildlingCards.map(wildlingCardData => {
        return new WildlingCard(++lastId, wildlingCardTypes.get(wildlingCardData.type));
    });
    // Shuffle the deck
    game.wildlingDeck = _.shuffle(game.wildlingDeck);

    const units = entireGame.selectedGameSetup.units ? entireGame.selectedGameSetup.units : baseGameData.units;

    // Initialize the starting positions
    Object.entries(units).forEach(([regionId, data]) => {
        data.filter(unitData => housesToCreate.includes(unitData.house)).forEach(unitData => {
            const region = game.world.regions.get(regionId);
            const house = game.houses.get(unitData.house);
            const unitType = unitTypes.get(unitData.unitType);
            const quantity = unitData.quantity;

            // Check if the game setup removed units off this region
            if (entireGame.selectedGameSetup.removedUnits && entireGame.selectedGameSetup.removedUnits.includes(region.id)) {
                return;
            }

            for (let i = 0;i < quantity;i++) {
                const unit = game.createUnit(region, unitType, house);

                region.units.set(unit.id, unit);
            }
        });
    });

    game.starredOrderRestrictions = baseGameData.starredOrderRestrictions[baseGameData.starredOrderRestrictions.findIndex(
        restrictions => game.houses.size <= restrictions.length)];

    game.skipRavenPhase = false; // todo: Remove unused var

    // Apply map changes
    if (entireGame.selectedGameSetup.powerTokensOnBoard) {
        Object.entries(entireGame.selectedGameSetup.powerTokensOnBoard).forEach(([houseId, regions]) => {
            const house = game.houses.tryGet(houseId, null);
            regions.forEach(r => game.world.getRegion(staticWorld.staticRegions.get(r)).controlPowerToken = house);
        });
    }

    if (entireGame.selectedGameSetup.garrisons) {
        Object.entries(entireGame.selectedGameSetup.garrisons).forEach(([regionId, garrison]) => {
            const staticRegion = staticWorld.staticRegions.get(regionId);
            game.world.getRegion(staticRegion).garrison = staticRegion.startingGarrison = garrison;
        });
    }

    return game;
}