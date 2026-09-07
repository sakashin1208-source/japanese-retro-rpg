extends Node

## 『妖幻奇譚 〜もののけ草子〜』セーブデータ永続化マネージャ (SaveManager)

const SAVE_PATH := "user://savegame.json"

func has_save_data() -> bool:
	return FileAccess.file_exists(SAVE_PATH)

func save_game() -> bool:
	var payload := {
		"version": 2,
	}
	payload.merge(GameState.to_dict())
	
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if not file:
		push_error("Failed to open save file for write: " + str(FileAccess.get_open_error()))
		return false
		
	var json_str := JSON.stringify(payload, "\t")
	file.store_string(json_str)
	file.close()
	return true

func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
		
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return false
		
	var text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var error := json.parse(text)
	if error != OK:
		push_error("Failed to parse save JSON: " + json.get_error_message())
		return false
		
	return GameState.load_dict(json.data)

func get_save_summary() -> String:
	if not has_save_data():
		return "（記録なし）"
		
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return "（読み込み失敗）"
		
	var text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	if json.parse(text) != OK:
		return "（破損データ）"
		
	var data: Dictionary = json.data
	var ch: int = data.get("currentChapter", 1)
	var time: String = data.get("savedAt", "不明")
	var party: Array = data.get("party", [])
	var lv: int = 1
	if not party.is_empty():
		lv = party[0].get("level", 1)
		
	return "第%d章 / Lv.%d / %s" % [ch, lv, time]

func clear_save() -> bool:
	if FileAccess.file_exists(SAVE_PATH):
		var dir := DirAccess.open("user://")
		return dir.remove("savegame.json") == OK
	return true
