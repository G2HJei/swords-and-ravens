import {observer} from "mobx-react";
import ResolveMarchOrderGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/ResolveMarchOrderGameState";
import {Component, ReactNode} from "react";
import ResolveSingleMarchOrderGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/resolve-single-march-order-game-state/ResolveSingleMarchOrderGameState";
import ResolveSingleMarchOrderComponent from "./ResolveSingleMarchOrderComponent";
import CombatGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/CombatGameState";
import CombatComponent from "./CombatComponent";
import GameStateComponentProps from "./GameStateComponentProps";
import renderChildGameState from "../utils/renderChildGameState";
import TakeControlOfEnemyPortGameState from "../../common/ingame-game-state/take-control-of-enemy-port-game-state/TakeControlOfEnemyPortGameState";
import TakeControlOfEnemyPortComponent from "./TakeControlOfEnemyPortComponent";
import CallForSupportAgainstNeutralForceGameState from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/call-for-support-against-neutral-force-game-state/CallForSupportAgainstNeutralForceGameState";
import CallForSupportAgainstNeutralForcesComponent from "./CallForSupportAgainstNeutralForcesComponent";

@observer
export default class ResolveMarchOrderComponent extends Component<GameStateComponentProps<ResolveMarchOrderGameState>> {
    render(): ReactNode {
        return renderChildGameState(this.props, [
            [ResolveSingleMarchOrderGameState, ResolveSingleMarchOrderComponent],
            [CombatGameState, CombatComponent],
            [TakeControlOfEnemyPortGameState, TakeControlOfEnemyPortComponent],
            [CallForSupportAgainstNeutralForceGameState, CallForSupportAgainstNeutralForcesComponent]
        ]);
    }
}
