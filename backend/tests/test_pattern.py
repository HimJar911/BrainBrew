def test_pattern_game_flow(test_client, test_user):
    headers = test_user

    # Start game
    res_start = test_client.post("/pattern/start", headers=headers, json={"grid_size": 3})
    assert res_start.status_code == 200
    data = res_start.json()
    assert "sequence" in data

    # Submit response
    fake_sequence = data["sequence"]
    res_submit = test_client.post("/pattern/submit", headers=headers, json={
        "game_id": data["game_id"],
        "sequence": fake_sequence,
        "response_time": 3.2
    })
    assert res_submit.status_code == 200
    assert "score" in res_submit.json()
