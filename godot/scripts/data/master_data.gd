extends Node

## 『妖幻奇譚 〜もののけ草子〜』不変マスターデータ (MasterData)

var data: Dictionary = {}
var characters: Array = []
var skills: Dictionary = {}
var enemies: Dictionary = {}
var items: Array = []
var npcs: Array = []
var chapters: Array = []

func _ready() -> void:
	load_master_data()

func load_master_data() -> void:
	var path := "res://assets/data/master_data.json"
	if not FileAccess.file_exists(path):
		push_error("MasterData file not found: " + path)
		return
	
	var file := FileAccess.open(path, FileAccess.READ)
	var json_text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var error := json.parse(json_text)
	if error != OK:
		push_error("Failed to parse MasterData JSON: " + json.get_error_message())
		return
	
	data = json.data
	characters = data.get("characters", [])
	skills = data.get("skills", {})
	enemies = data.get("enemies", {})
	items = data.get("items", [])
	npcs = data.get("npcs", [])
	chapters = data.get("chapters", [])

func get_character(char_id: String) -> Dictionary:
	for c in characters:
		if c.get("id") == char_id:
			return c
	return {}

func get_skill(skill_id: String) -> Dictionary:
	return skills.get(skill_id, {
		"id": skill_id,
		"name": "技",
		"mpCost": 0,
		"type": "physical",
		"target": "enemy_single",
		"power": 1.0,
		"desc": "",
		"effectType": "slash"
	})

func get_enemy(enemy_id: String) -> Dictionary:
	return enemies.get(enemy_id, {})

func get_item(item_id: String) -> Dictionary:
	for it in items:
		if it.get("id") == item_id:
			return it
	return {}

## 章の解放状態（指示書§4.1(1) 必須仕様: 既存フラグから自動導出）
func is_chapter_unlocked(ch: int, boss_defeated: Dictionary, artifacts: Dictionary) -> bool:
	match ch:
		1:
			return true
		2:
			return boss_defeated.get("youko", false)
		3:
			return boss_defeated.get("shuten", false) and artifacts.get("mirror", false) and artifacts.get("magatama", false)
		_:
			return false
