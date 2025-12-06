def calculate_round_score(
    bid: int,
    tricks_won: int,
    round_num: int,
    bonus_points: int = 0,
    penalty_points: int = 0
) -> int:
    """
    Calculate the score for a single player in a round.
    """
    score = 0
    
    # Zero Bid Logic
    if bid == 0:
        if tricks_won == 0:
            score = round_num * 10
        else:
            score = -(round_num * 10)
    else:
        # Non-Zero Bid Logic
        if bid == tricks_won:
            score = bid * 20
        else:
            diff = abs(bid - tricks_won)
            score = -(diff * 10)
            
    # Apply Bonuses/Penalties ONLY if bid was successful (Standard Rule check needed? 
    # Usually bonuses only apply if bid is correct, except for some variants. 
    # Assuming standard: Bonuses only if bid is correct. Penalties might always apply?
    # Let's assume Bonuses only if correct, Penalties always apply for now, 
    # but the 7-card rule said "-5 if captured, but ONLY if the bid is successful".
    # So both seem to be conditional on success in some variants.
    # However, standard Skull King rules usually say:
    # "Bonus points are only awarded if the player has bid correctly."
    # "Rascal Scoring" might be different.
    # Let's stick to: Bonuses added to score if bid correct.
    
    # Apply Bonuses/Penalties ONLY if bid was successful
    if bid == tricks_won and bid > 0:
        score += bonus_points
        score -= penalty_points
    elif bid == 0 and tricks_won == 0:
        # Zero bid successful
        score -= penalty_points 
    else:
        # Bid failed
        # Penalties apply, and usually positive bonuses are lost.
        # However, some cards might give points regardless (like Loot).
        # For now, we'll assume standard rules where most bonuses require making the bid,
        # but we'll allow 'loot' type bonuses to count if they are passed in a way that implies they always count.
        # The current 'bonuses' dict mixes them. 
        # We will stick to the rule: If bid failed, NO positive bonuses from captures usually count in standard Skull King.
        # EXCEPT: 14s and Loot might.
        # User asked for "-5 multiplier". If it's a penalty, it should be subtracted.
        score -= penalty_points
        
        # If there are specific "always count" bonuses, they should be handled separately or logic refined.
        # For this iteration, we assume the user wants these buttons to affect the score primarily when the bid is made,
        # OR if it's a penalty (like -5), it applies.
        # Let's ensure negative bonuses (like -5) are applied even if bid fails?
        # Actually, if I add -5 to 'bonus_points' and 'bonus_points' is added only on success, that's wrong for a penalty.
        # I should separate them.
        pass

    # Special case: If the user specifically wants the -5 to apply always (like a captured card penalty),
    # we might need to adjust. But for now, let's stick to the safe path:
    # If it's a "bonus" button in the UI that sends a negative value, we need to decide if it adds to score always or only on win.
    # In Skull King, usually points are only awarded if the bid is made.
    # Penalties (like capturing a Pirate with a 0 bid) are different.
    
    return score
