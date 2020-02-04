import HouseCardAbility from "./HouseCardAbility";
import HouseCard from "./HouseCard";
import House from "../House";
import PostCombatGameState
    from "../../action-game-state/resolve-march-order-game-state/combat-game-state/post-combat-game-state/PostCombatGameState";

export default class ArianneMartellHouseCardAbility extends HouseCardAbility {
    doesPreventAttackingArmyFromMoving(postCombat: PostCombatGameState, house: House, _houseCard: HouseCard): boolean {
        if (postCombat.loser == house && postCombat.defender == house) {
            postCombat.parentGameState.ingameGameState.log({
                type: "arianne-martell-prevent-movement",
                house: house.id,
                enemyHouse: postCombat.combat.getEnemy(house).id
            });

            return true;
        }

        return false;
    }
}
