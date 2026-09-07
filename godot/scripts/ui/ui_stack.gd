extends Node
class_name UIStack

## スタック型UIマネージャ (UIStack)
## 排他的なUI画面（メニュー、ダイアログ、選択画面等）をスタックで管理

var stack: Array[Control] = []

func push_ui(ui: Control) -> void:
	if not ui.is_inside_tree():
		add_child(ui)
	ui.visible = true
	stack.append(ui)
	if ui.has_method("on_push"):
		ui.on_push()

func pop_ui() -> Control:
	if stack.is_empty():
		return null
		
	var ui: Control = stack.pop_back()
	if ui.has_method("on_pop"):
		ui.on_pop()
	ui.visible = false
	return ui

func clear_all() -> void:
	while not stack.is_empty():
		pop_ui()

func get_top() -> Control:
	if stack.is_empty():
		return null
	return stack[-1]

func is_empty() -> bool:
	return stack.is_empty()

func _unhandled_input(event: InputEvent) -> void:
	if is_empty():
		return
		
	var top: Control = get_top()
	if top and top.has_method("handle_custom_input"):
		top.handle_custom_input(event)
