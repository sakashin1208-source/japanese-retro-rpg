extends Control
class_name ItemWindow

## 道具一覧・使用ウィンドウ (ItemWindow)
## マップ・戦闘共用

signal item_used(item: Dictionary, target_index: int)
signal cancelled

var is_battle: bool = false
var selected_index: int = 0
var target_select_mode: bool = false
var selected_target_index: int = 0
var valid_targets: Array = []

var frame_ctrl: UrushiFrame
var list_container: VBoxContainer
var desc_label: Label
var target_container: VBoxContainer

func _ready() -> void:
	custom_minimum_size = Vector2(800, 500)
	size = Vector2(800, 500)
	position = Vector2(240, 200)
	
	frame_ctrl = UrushiFrame.new()
	frame_ctrl.title = "所持道具"
	frame_ctrl.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(frame_ctrl)
	
	list_container = VBoxContainer.new()
	list_container.position = Vector2(40, 60)
	list_container.size = Vector2(720, 280)
	add_child(list_container)
	
	desc_label = Label.new()
	desc_label.position = Vector2(40, 360)
	desc_label.size = Vector2(720, 100)
	desc_label.add_theme_font_size_override("font_size", 24)
	desc_label.add_theme_color_override("font_color", Color(0.9, 0.85, 0.7))
	desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(desc_label)

func open(p_is_battle: bool = false) -> void:
	is_battle = p_is_battle
	target_select_mode = false
	selected_index = 0
	visible = true
	refresh_list()

func refresh_list() -> void:
	for c in list_container.get_children():
		c.queue_free()
		
	var items: Array = GameState.items
	for i in range(items.size()):
		var it: Dictionary = items[i]
		var lbl := Label.new()
		var count: int = it.get("count", 0)
		var prefix := "▶ " if i == selected_index else "   "
		lbl.text = "%s%s   x%d" % [prefix, it.get("name", ""), count]
		lbl.add_theme_font_size_override("font_size", 28)
		
		if count > 0:
			lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.4) if i == selected_index else Color.WHITE)
		else:
			lbl.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))
			
		list_container.add_child(lbl)
		
	# もどる選択肢
	var back_lbl := Label.new()
	var is_back_sel := (selected_index == items.size())
	back_lbl.text = ("▶ " if is_back_sel else "   ") + "もどる"
	back_lbl.add_theme_font_size_override("font_size", 28)
	back_lbl.add_theme_color_override("font_color", Color(1, 0.9, 0.4) if is_back_sel else Color(0.8, 0.8, 0.8))
	list_container.add_child(back_lbl)
	
	# 説明文の更新
	if selected_index < items.size():
		desc_label.text = items[selected_index].get("desc", "")
	else:
		desc_label.text = "前の画面に戻ります。"

func handle_custom_input(event: InputEvent) -> void:
	if not visible:
		return
	if event.is_echo():
		return
		
	var total_count := GameState.items.size() + 1
	
	if event.is_action_pressed("ui_up"):
		selected_index = (selected_index - 1 + total_count) % total_count
		AudioManager.play_se("se_cursor")
		refresh_list()
	elif event.is_action_pressed("ui_down"):
		selected_index = (selected_index + 1) % total_count
		AudioManager.play_se("se_cursor")
		refresh_list()
	elif event.is_action_pressed("confirm"):
		if selected_index == GameState.items.size():
			# もどる
			AudioManager.play_se("se_cancel")
			close()
		else:
			var it: Dictionary = GameState.items[selected_index]
			if it.get("count", 0) > 0:
				AudioManager.play_se("se_select")
				use_selected_item(it)
			else:
				AudioManager.play_se("se_cancel")
	elif event.is_action_pressed("cancel"):
		AudioManager.play_se("se_cancel")
		close()

func use_selected_item(item: Dictionary) -> void:
	# 単体回復アイテム：先頭の負傷者、または先頭キャラへ適用
	# 蘇生アイテム：戦闘不能キャラへ適用
	var target_idx := 0
	if item.get("type") == "revive":
		var found_dead := false
		for i in range(GameState.party.size()):
			if GameState.party[i].get("hp", 0) <= 0:
				target_idx = i
				found_dead = true
				break
		if not found_dead:
			AudioManager.play_se("se_cancel")
			desc_label.text = "倒れている仲間がいません。"
			return
	else:
		# 最もHPの減っているキャラを探す
		var min_ratio := 1.0
		for i in range(GameState.party.size()):
			var p: Dictionary = GameState.party[i]
			if p.get("hp", 0) > 0:
				var r: float = float(p.get("hp", 1)) / float(p.get("maxHp", 1))
				if r < min_ratio:
					min_ratio = r
					target_idx = i
					
	# 使用処理
	item["count"] -= 1
	var target: Dictionary = GameState.party[target_idx]
	if item.get("type") == "heal_hp":
		var heal_amt: int = item.get("value", 50)
		target["hp"] = min(target.get("maxHp", 100), target.get("hp", 0) + heal_amt)
		AudioManager.play_se("se_heal")
		desc_label.text = "%sのHPが回復した！" % target.get("name", "")
	elif item.get("type") == "heal_mp":
		var heal_amt: int = item.get("value", 20)
		target["mp"] = min(target.get("maxMp", 50), target.get("mp", 0) + heal_amt)
		AudioManager.play_se("se_heal")
		desc_label.text = "%sのMPが回復した！" % target.get("name", "")
	elif item.get("type") == "revive":
		target["hp"] = int(target.get("maxHp", 100) * 0.5)
		AudioManager.play_se("se_heal")
		desc_label.text = "%sが息を吹き返した！" % target.get("name", "")
		
	item_used.emit(item, target_idx)
	refresh_list()

func close() -> void:
	visible = false
	cancelled.emit()
