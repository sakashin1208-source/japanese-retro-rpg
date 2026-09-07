@tool
extends Control
class_name UrushiFrame

## 和風漆枠フレーム (UrushiFrame)
## 金縁・漆塗りグラデーション・タイトル銘板

@export var title: String = "" :
	set(v):
		title = v
		queue_redraw()

@export var border_color: Color = Color(0.83, 0.69, 0.22, 1.0) # #d4af37 (金)
@export var bg_color: Color = Color(0.08, 0.05, 0.11, 0.92)    # 漆黒紫
@export var corner_radius: float = 6.0

func _ready() -> void:
	mouse_filter = MOUSE_FILTER_PASS

func _draw() -> void:
	var rect := get_rect()
	var w := rect.size.x
	var h := rect.size.y
	
	if w <= 10 or h <= 10:
		return
		
	# 1. 影
	draw_rect(Rect2(4, 4, w, h), Color(0, 0, 0, 0.45), true)
	
	# 2. 漆塗り本体背景
	draw_rect(Rect2(0, 0, w, h), bg_color, true)
	
	# 3. 外枠（金縁 3px）
	draw_rect(Rect2(1, 1, w - 2, h - 2), border_color, false, 3.0)
	
	# 4. 内枠（装飾細線 1px）
	draw_rect(Rect2(5, 5, w - 10, h - 10), Color(border_color.r, border_color.g, border_color.b, 0.4), false, 1.0)
	
	# 5. 四隅の金具装飾
	var corner_len := 16.0
	# 左上
	draw_line(Vector2(2, 2), Vector2(2 + corner_len, 2), border_color, 4.0)
	draw_line(Vector2(2, 2), Vector2(2, 2 + corner_len), border_color, 4.0)
	# 右上
	draw_line(Vector2(w - 2, 2), Vector2(w - 2 - corner_len, 2), border_color, 4.0)
	draw_line(Vector2(w - 2, 2), Vector2(w - 2, 2 + corner_len), border_color, 4.0)
	# 左下
	draw_line(Vector2(2, h - 2), Vector2(2 + corner_len, h - 2), border_color, 4.0)
	draw_line(Vector2(2, h - 2), Vector2(2, h - 2 - corner_len), border_color, 4.0)
	# 右下
	draw_line(Vector2(w - 2, h - 2), Vector2(w - 2 - corner_len, h - 2), border_color, 4.0)
	draw_line(Vector2(w - 2, h - 2), Vector2(w - 2, h - 2 - corner_len), border_color, 4.0)
	
	# 6. タイトル銘板（タイトルがある場合）
	if title != "":
		var font := ThemeDB.fallback_font
		var font_size := 22
		var string_size := font.get_string_size(title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
		var tag_w := string_size.x + 36.0
		var tag_h := 32.0
		var tag_x := (w - tag_w) / 2.0
		var tag_y := -12.0
		
		# 銘板背景
		draw_rect(Rect2(tag_x, tag_y, tag_w, tag_h), Color(0.12, 0.06, 0.16, 0.98), true)
		draw_rect(Rect2(tag_x, tag_y, tag_w, tag_h), border_color, false, 2.0)
		
		# 銘板テキスト
		draw_string(font, Vector2(tag_x + 18, tag_y + 22), title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(1.0, 0.92, 0.65))
