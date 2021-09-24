import ResolveConsolidatePowerGameState
    from "../../common/ingame-game-state/action-game-state/resolve-consolidate-power-game-state/ResolveConsolidatePowerGameState";
import {observer} from "mobx-react";
import {Component, ReactNode} from "react";
import PlayerMusteringComponent from "./PlayerMusteringComponent";
import renderChildGameState from "../utils/renderChildGameState";
import PlayerMusteringGameState
    from "../../common/ingame-game-state/westeros-game-state/mustering-game-state/player-mustering-game-state/PlayerMusteringGameState";
import GameStateComponentProps from "./GameStateComponentProps";
import ResolveSingleConsolidatePowerGameState from "../../common/ingame-game-state/action-game-state/resolve-single-consolidate-power-game-state/ResolveSingleConsolidatePowerGameState";
import ResolveSingleConsolidatePowerComponent from "./ResolveSingleConsolidatePowerComponent";

@observer
export default class ResolveConsolidatePowerComponent extends Component<GameStateComponentProps<ResolveConsolidatePowerGameState>> {
    render(): ReactNode {
        return renderChildGameState(this.props, [
            [ResolveSingleConsolidatePowerGameState, ResolveSingleConsolidatePowerComponent],
            [PlayerMusteringGameState, PlayerMusteringComponent]
        ]);
    }
}
