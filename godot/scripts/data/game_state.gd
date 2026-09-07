extends Node

## 『妖幻奇譚 〜もののけ草子〜』実行時ゲーム状態 (GameState)

var party: Array = []
var items: Array = []
var money: int = 0
var current_chapter: int = 1

var boss_defeated: Dictionary = {
	"akaoni": false,
	"tengu": false,
	"youko": false,
	"hyoka": false,
	"mizuchi": false,
	"shuten": false,
	"ibaraki": false,
	"musokage": false,
	"shin_youko": false
}

var artifacts: Dictionary = {
	"mirror": false,
	"magatama": false,
	"sword": false
}

var player_pos: Dictionary = {
	"grid_x": 12,
	"grid_y": 14,
	"facing": "down"
}

func _ready() -> void:
	reset()

func reset() -> void:
	# MasterData の準備を待つ
	if MasterData.characters.is_empty():
		MasterData.load_master_data()
	
	party = MasterData.characters.duplicate(true)
	items = MasterData.items.duplicate(true)
	money = 0
	current_chapter = 1
	
	for k in boss_defeated.keys():
		boss_defeated[k] = false
		
	for k in artifacts.keys():
		artifacts[k] = false
		
	player_pos = {
		"grid_x": 12,
		"grid_y": 14,
		"facing": "down"
	}

func to_dict() -> Dictionary:
	var dt := Time.get_datetime_dict_from_system()
	var time_str := "%d/%d %02d:%02d" % [dt.month, dt.day, dt.hour, dt.minute]
	return {
		"savedAt": time_str,
		"currentChapter": current_chapter,
		"money": money,
		"party": party.duplicate(true),
		"items": items.duplicate(true),
		"bossDefeated": boss_defeated.duplicate(true),
		"artifacts": artifacts.duplicate(true),
		"player": player_pos.duplicate(true)
	}

func load_dict(data: Dictionary) -> bool:
	if data.is_empty():
		return false
		
	current_chapter = data.get("currentChapter", 1)
	money = data.get("money", 0)
	
	if data.has("party") and data["party"] is Array:
		party = data["party"].duplicate(true)
		
	if data.has("items") and data["items"] is Array:
		items = data["items"].duplicate(true)
		
	if data.has("bossDefeated") and data["bossDefeated"] is Dictionary:
		for k in data["bossDefeated"].keys():
			boss_defeated[k] = data["bossDefeated"][k]
			
	if data.has("artifacts") and data["artifacts"] is Dictionary:
		for k in data["artifacts"].keys():
			artifacts[k] = data["artifacts"][k]
			
	if data.has("player") and data["player"] is Dictionary:
		player_pos["grid_x"] = data["player"].get("gridX", data["player"].get("grid_x", 12))
		player_pos["grid_y"] = data["player"].get("gridY", data["player"].get("grid_y", 14))
		player_pos["facing"] = data["player"].get("facing", "down")
		
	return true
