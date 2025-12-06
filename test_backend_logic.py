import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.services.scoring import calculate_round_score

def test_scoring():
    print("Testing Scoring Logic...")
    
    # Test 1: Bid 0, Won 0 (Round 1) -> +10
    score = calculate_round_score(bid=0, tricks_won=0, round_num=1)
    assert score == 10, f"Test 1 Failed: Expected 10, got {score}"
    print("Test 1 Passed (Bid 0, Won 0)")

    # Test 2: Bid 0, Won 1 (Round 1) -> -10
    score = calculate_round_score(bid=0, tricks_won=1, round_num=1)
    assert score == -10, f"Test 2 Failed: Expected -10, got {score}"
    print("Test 2 Passed (Bid 0, Won 1)")

    # Test 3: Bid 1, Won 1 (Round 5) -> 20
    score = calculate_round_score(bid=1, tricks_won=1, round_num=5)
    assert score == 20, f"Test 3 Failed: Expected 20, got {score}"
    print("Test 3 Passed (Bid 1, Won 1)")

    # Test 4: Bid 1, Won 0 (Round 5) -> -10
    score = calculate_round_score(bid=1, tricks_won=0, round_num=5)
    assert score == -10, f"Test 4 Failed: Expected -10, got {score}"
    print("Test 4 Passed (Bid 1, Won 0)")
    
    # Test 5: Bid 2, Won 4 (Round 5) -> -20 (Diff is 2)
    score = calculate_round_score(bid=2, tricks_won=4, round_num=5)
    assert score == -20, f"Test 5 Failed: Expected -20, got {score}"
    print("Test 5 Passed (Bid 2, Won 4)")

    # Test 6: Bid 1, Won 1, Bonus 20 -> 40
    score = calculate_round_score(bid=1, tricks_won=1, round_num=5, bonus_points=20)
    assert score == 40, f"Test 6 Failed: Expected 40, got {score}"
    print("Test 6 Passed (Bonus)")

    print("All scoring tests passed!")

if __name__ == "__main__":
    test_scoring()
