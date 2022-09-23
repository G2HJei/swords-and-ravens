import GameState from "../../../../../../../GameState";
import AfterWinnerDeterminationGameState from "../AfterWinnerDeterminationGameState";
import SimpleChoiceGameState, {SerializedSimpleChoiceGameState} from "../../../../../../simple-choice-game-state/SimpleChoiceGameState";
import Game from "../../../../../../game-data-structure/Game";
import CombatGameState from "../../../CombatGameState";
import House from "../../../../../../game-data-structure/House";
import Player from "../../../../../../Player";
import {ClientMessage} from "../../../../../../../../messages/ClientMessage";
import {ServerMessage} from "../../../../../../../../messages/ServerMessage";
import ActionGameState from "../../../../../ActionGameState";
import IngameGameState from "../../../../../../IngameGameState";
import { reek } from "../../../../../../game-data-structure/house-card/houseCardAbilities";

export default class ReekAbilityGameState extends GameState<
    AfterWinnerDeterminationGameState["childGameState"],
    SimpleChoiceGameState
> {
    get game(): Game {
        return this.parentGameState.game;
    }

    get actionGameState(): ActionGameState {
        return this.combatGameState.actionGameState;
    }

    get combatGameState(): CombatGameState {
        return this.parentGameState.combatGameState;
    }

    get ingame(): IngameGameState {
        return this.parentGameState.parentGameState.parentGameState.parentGameState.ingameGameState;
    }

    firstStart(house: House): void {
        this.setChildGameState(new SimpleChoiceGameState(this))
            .firstStart(
                house,
                "",
                ["Return Reek to Hand", "Ignore"]
            );
    }

    onSimpleChoiceGameStateEnd(choice: number): void {
        const house = this.childGameState.house;

        if (choice == 0) {
            const reekHc = this.combatGameState.houseCombatDatas.values.find(hcd => hcd.houseCard?.ability?.id == reek.id)?.houseCard;

            if (!reekHc) {
                throw new Error("Reek not found!");
            }
            this.parentGameState.parentGameState.parentGameState.markHouseCardAsAvailable(house, reekHc);
            this.ingame.log({
                type: "reek-used",
                house: house.id
            });
        } else {
            this.ingame.log({
                type: "house-card-ability-not-used",
                house: house.id,
                houseCard: reek.id
            });
        }
        this.parentGameState.onHouseCardResolutionFinish(house);
    }

    onPlayerMessage(player: Player, message: ClientMessage): void {
        this.childGameState.onPlayerMessage(player, message);
    }

    onServerMessage(message: ServerMessage): void {
        this.childGameState.onServerMessage(message);
    }

    serializeToClient(admin: boolean, player: Player | null): SerializedReekAbilityGameState {
        return {
            type: "reek-ability",
            childGameState: this.childGameState.serializeToClient(admin, player)
        };
    }

    static deserializeFromServer(afterWinnerDeterminationChild: AfterWinnerDeterminationGameState["childGameState"], data: SerializedReekAbilityGameState): ReekAbilityGameState {
        const reekAbilityGameState = new ReekAbilityGameState(afterWinnerDeterminationChild);

        reekAbilityGameState.childGameState = reekAbilityGameState.deserializeChildGameState(data.childGameState);

        return reekAbilityGameState;
    }

    deserializeChildGameState(data: SerializedReekAbilityGameState["childGameState"]): ReekAbilityGameState["childGameState"] {
        return SimpleChoiceGameState.deserializeFromServer(this, data);
    }
}

export interface SerializedReekAbilityGameState {
    type: "reek-ability";
    childGameState: SerializedSimpleChoiceGameState;
}
