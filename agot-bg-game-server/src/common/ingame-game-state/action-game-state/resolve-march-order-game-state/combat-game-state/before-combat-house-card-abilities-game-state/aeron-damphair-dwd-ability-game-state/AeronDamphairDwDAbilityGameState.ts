import GameState from "../../../../../../GameState";
import Game from "../../../../../game-data-structure/Game";
import CombatGameState from "../../CombatGameState";
import House from "../../../../../game-data-structure/House";
import Player from "../../../../../Player";
import {ClientMessage} from "../../../../../../../messages/ClientMessage";
import {ServerMessage} from "../../../../../../../messages/ServerMessage";
import IngameGameState from "../../../../../IngameGameState";
import BeforeCombatHouseCardAbilitiesGameState from "../BeforeCombatHouseCardAbilitiesGameState";
import User from "../../../../../../../server/User";
import { aeronDamphairDwD } from "../../../../../game-data-structure/house-card/houseCardAbilities";
import HouseCardModifier from "../../../../../game-data-structure/house-card/HouseCardModifier";
import { HouseCardState } from "../../../../../../../common/ingame-game-state/game-data-structure/house-card/HouseCard";

export default class AeronDamphairDwDAbilityGameState extends GameState<
    BeforeCombatHouseCardAbilitiesGameState["childGameState"]> {
    house: House;
    nerfed: boolean;

    get game(): Game {
        return this.parentGameState.game;
    }

    get combatGameState(): CombatGameState {
        return this.parentGameState.combatGameState;
    }

    get ingame(): IngameGameState {
        return this.parentGameState.parentGameState.parentGameState.ingameGameState;
    }

    get maxAllowedPowerTokens(): number {
        return this.nerfed
            ? this.house.houseCards.values.filter(hc => hc.state == HouseCardState.USED).length
            : this.house.powerTokens;
    }

    firstStart(house: House, nerfed: boolean): void {
        this.house = house;
        this.nerfed = nerfed;
        if (house.powerTokens == 0 || this.maxAllowedPowerTokens == 0) {
            this.ingame.log({
                type: "house-card-ability-not-used",
                house: house.id,
                houseCard: aeronDamphairDwD.id
            }, true);

            this.parentGameState.onHouseCardResolutionFinish(house);
        }
    }

    onPlayerMessage(player: Player, message: ClientMessage): void {
        if (message.type == "bid") {
            if (this.ingame.getControllerOfHouse(this.house) != player) {
                return;
            }

            const pt = Math.max(0, Math.min(message.powerTokens, this.maxAllowedPowerTokens));
            this.ingame.changePowerTokens(this.house, -pt);

            const houseCardModifier = new HouseCardModifier();
            houseCardModifier.combatStrength = pt;
            this.combatGameState.houseCardModifiers.set(aeronDamphairDwD.id, houseCardModifier);

            this.entireGame.broadcastToClients({
                type: "update-house-card-modifier",
                id: aeronDamphairDwD.id,
                modifier: houseCardModifier
            });

            this.ingame.log({
                type: "aeron-damphair-used",
                house: this.house.id,
                tokens: pt
            });

            this.parentGameState.onHouseCardResolutionFinish(this.house);
        }
    }

    getWaitedUsers(): User[] {
        return [this.ingame.getControllerOfHouse(this.house).user];
    }

    onServerMessage(_message: ServerMessage): void {
    }

    sendPowerTokens(powerTokens: number): void {
        this.entireGame.sendMessageToServer({
            type: "bid",
            powerTokens: powerTokens
        });
    }

    serializeToClient(_admin: boolean, _player: Player | null): SerializedAeronDamphairDwDAbilityGameState {
        return {
            type: "aeron-damphair-dwd-ability",
            house: this.house.id,
            nerfed: this.nerfed
        };
    }

    static deserializeFromServer(houseCardResolution: BeforeCombatHouseCardAbilitiesGameState["childGameState"], data: SerializedAeronDamphairDwDAbilityGameState): AeronDamphairDwDAbilityGameState {
        const aeronDamphairDwDAbilityGameState = new AeronDamphairDwDAbilityGameState(houseCardResolution);

        aeronDamphairDwDAbilityGameState.house = houseCardResolution.game.houses.get(data.house);
        aeronDamphairDwDAbilityGameState.nerfed = data.nerfed;

        return aeronDamphairDwDAbilityGameState;
    }
}

export interface SerializedAeronDamphairDwDAbilityGameState {
    type: "aeron-damphair-dwd-ability";
    house: string;
    nerfed: boolean;
}
