import {observer} from "mobx-react";
import {Component, ReactNode} from "react";
import GameStateComponentProps from "../GameStateComponentProps";
import renderChildGameState from "../../utils/renderChildGameState";
import React from "react";
import Col from "react-bootstrap/Col";
import AeronDamphairDwDAbilityGameState from "../../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/before-combat-house-card-abilities-game-state/aeron-damphair-dwd-ability-game-state/AeronDamphairDwDAbilityGameState";
import BiddingGameState from "../../../common/ingame-game-state/westeros-game-state/bidding-game-state/BiddingGameState";
import BiddingComponent from "../BiddingComponent";

@observer
export default class AeronDamphairAbilityComponent extends Component<GameStateComponentProps<AeronDamphairDwDAbilityGameState>> {
    render(): ReactNode {
        return (
            <>
                <Col xs={12}>
                    <b>Aeron Damphair:</b> Greyjoy may discard any number of available Power token to increase the combat strength of his card by the number of Power tokens discarded.
                </Col>
                {renderChildGameState(this.props, [
                    [BiddingGameState, BiddingComponent],
                ])}
            </>
        );
    }
}
