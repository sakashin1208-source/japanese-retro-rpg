/**
 * 妖幻奇譚 〜もののけ草子〜 不変マスターデータ定義 (MASTER)
 */

export const MASTER = Object.freeze({
  // プレイヤーパーティ初期ステータス定義
  characters: [
    {
      id: 'hayate',
      name: '疾風（はやて）',
      title: '風神無想流の若武者',
      job: '侍',
      level: 1,
      maxHp: 52,
      hp: 52,
      maxMp: 14,
      mp: 14,
      atk: 20,
      def: 13,
      matk: 7,
      spd: 15,
      exp: 0,
      nextExp: 30,
      skills: ['iai', 'shinku_ha'],
      spriteKey: 'samurai',
      row: 0,
      skillLearns: [
        { level: 3, skillId: 'fujin_ranbu', name: '風刃乱舞' },
        { level: 5, skillId: 'meikyo_shisui', name: '明鏡止水' },
        { level: 7, skillId: 'tensho_fujin', name: '奥義・天翔風塵斬' }
      ]
    },
    {
      id: 'sayo',
      name: '小夜（さよ）',
      title: '白鷺神社の神子',
      job: '巫女',
      level: 1,
      maxHp: 38,
      hp: 38,
      maxMp: 32,
      mp: 32,
      atk: 9,
      def: 10,
      matk: 22,
      spd: 11,
      exp: 0,
      nextExp: 30,
      skills: ['hama_hikari', 'shinki_chiyu', 'kaen_fu'],
      spriteKey: 'miko',
      row: 1,
      skillLearns: [
        { level: 3, skillId: 'kiyome_kekkai', name: '清めの結界' },
        { level: 5, skillId: 'shinki_daichiyu', name: '神気大治癒' },
        { level: 7, skillId: 'tenkei_joka', name: '秘術・天恵浄化光' }
      ]
    },
    {
      id: 'oboro',
      name: '朧（おぼろ）',
      title: '月影忍軍の若き頭領',
      job: '忍',
      level: 1,
      maxHp: 44,
      hp: 44,
      maxMp: 20,
      mp: 20,
      atk: 16,
      def: 11,
      matk: 14,
      spd: 22,
      exp: 0,
      nextExp: 30,
      skills: ['shuriken', 'raiton', 'kagenui'],
      spriteKey: 'ninja',
      row: 2,
      skillLearns: [
        { level: 3, skillId: 'kawarimi', name: '変わり身の術' },
        { level: 5, skillId: 'suiton', name: '水遁・濁流波' },
        { level: 7, skillId: 'midare_chidori', name: '禁術・月影乱れ千鳥' }
      ]
    }
  ],

  // 技・術データ（全18種）
  skills: {
    iai: { id: 'iai', name: '居合い一閃', mpCost: 3, type: 'physical', target: 'enemy_single', power: 1.6, desc: '神速の抜刀術。敵単体に大打撃を与える。', effectType: 'slash' },
    shinku_ha: { id: 'shinku_ha', name: '真空波', mpCost: 6, type: 'physical', target: 'enemy_all', power: 1.15, desc: '刀から放つ突風の刃で敵全体を一掃する。', effectType: 'wind' },
    fujin_ranbu: { id: 'fujin_ranbu', name: '風刃乱舞', mpCost: 8, type: 'physical', target: 'enemy_single', power: 2.3, desc: '疾風怒濤の連続斬撃。会心の一撃が出やすい。', effectType: 'slash_heavy' },
    meikyo_shisui: { id: 'meikyo_shisui', name: '明鏡止水', mpCost: 6, type: 'buff_self', target: 'self', power: 1.5, desc: '心を研ぎ澄まし、自身の攻撃力と素早さを高める。', effectType: 'buff_atk_spd' },
    tensho_fujin: { id: 'tensho_fujin', name: '奥義・天翔風塵斬', mpCost: 14, type: 'physical', target: 'enemy_all', power: 2.6, desc: '風神無想流の究極奥義。天を裂く巨大竜巻で全体を粉砕。', effectType: 'tornado' },

    shinki_chiyu: { id: 'shinki_chiyu', name: '神気治癒', mpCost: 4, type: 'heal', target: 'ally_single', power: 50, desc: '清らかな祈りで味方一人のHPを中回復する。', effectType: 'heal' },
    hama_hikari: { id: 'hama_hikari', name: '破魔の光', mpCost: 5, type: 'magical', target: 'enemy_single', power: 1.8, desc: '神聖な光弾を放ち、妖怪を浄化する。', effectType: 'holy' },
    kaen_fu: { id: 'kaen_fu', name: '火炎の符', mpCost: 8, type: 'magical', target: 'enemy_all', power: 1.35, desc: '霊符から紅蓮の炎を巻き起こし、敵全体を焼き払う。', effectType: 'fire' },
    kiyome_kekkai: { id: 'kiyome_kekkai', name: '清めの結界', mpCost: 7, type: 'buff_all', target: 'ally_all', power: 1.35, desc: '神木千歳杉の結界を張り、味方全体の防御力を高める。', effectType: 'buff_def_all' },
    shinki_daichiyu: { id: 'shinki_daichiyu', name: '神気大治癒', mpCost: 10, type: 'heal_all', target: 'ally_all', power: 65, desc: '広範囲に神気を降らせ、味方全員のHPを回復する。', effectType: 'heal' },
    tenkei_joka: { id: 'tenkei_joka', name: '秘術・天恵浄化光', mpCost: 18, type: 'magical_revive', target: 'enemy_all', power: 2.8, desc: '天神の光柱を降臨させ、敵全体を浄化し倒れた味方を蘇生。', effectType: 'holy_pillar' },

    shuriken: { id: 'shuriken', name: '手裏剣乱舞', mpCost: 4, type: 'physical', target: 'enemy_all', power: 1.15, desc: '無数の手裏剣を投擲し、敵全体を素早く攻撃する。', effectType: 'slash' },
    raiton: { id: 'raiton', name: '雷遁の術', mpCost: 7, type: 'magical', target: 'enemy_single', power: 2.1, desc: '秘伝の印を結び、激しい雷光で敵単体を貫く。', effectType: 'thunder' },
    kagenui: { id: 'kagenui', name: '影縫いの術', mpCost: 5, type: 'physical', target: 'enemy_single', power: 1.45, desc: '影を刺して動きを封じ、急所に一撃を見舞う。', effectType: 'slash' },
    kawarimi: { id: 'kawarimi', name: '変わり身の術', mpCost: 6, type: 'buff_self', target: 'self', power: 1.0, desc: '丸太と身を入れ替え、敵の攻撃を確実に回避する。', effectType: 'evasion' },
    suiton: { id: 'suiton', name: '水遁・濁流波', mpCost: 10, type: 'magical', target: 'enemy_all', power: 1.8, desc: '激しい大津波を呼び寄せ、敵全体を押し流す。', effectType: 'water' },
    midare_chidori: { id: 'midare_chidori', name: '禁術・月影乱れ千鳥', mpCost: 15, type: 'magical', target: 'enemy_single', power: 3.2, desc: '紫電を両手に纏い、千羽の鳥の如き速度で急所を連撃する。', effectType: 'purple_lightning' }
  },

  // アイテム初期定義
  items: [
    { id: 'kizugusuri', name: '傷薬', count: 9, type: 'heal_hp', target: 'ally_single', value: 50, desc: '薬草から調合された傷薬。味方1人のHPを50回復する。' },
    { id: 'miki', name: '神酒', count: 6, type: 'heal_mp', target: 'ally_single', value: 30, desc: '神に捧げられた霊酒。味方1人のMPを30回復する。' },
    { id: 'senzu', name: '仙豆', count: 4, type: 'revive', target: 'ally_single', value: 0.5, desc: '霊山に実る秘薬。戦闘不能の味方をHP全快で蘇生する。' }
  ],

  // 敵データ (全50種 + ボス9体)
  enemies: {
    // 第一章魔物 (20種)
    karakasa: { id: 'karakasa', name: 'から傘小僧', maxHp: 32, hp: 32, atk: 12, def: 5, spd: 12, exp: 12, money: 14, spriteKey: 'karakasa', actions: [{ type: 'attack', name: '飛び蹴り', rate: 70 }, { type: 'lick', name: '大舌なめ', rate: 30 }] },
    chochin: { id: 'chochin', name: '提灯お化け', maxHp: 40, hp: 40, atk: 15, def: 7, spd: 8, exp: 16, money: 18, spriteKey: 'chochin', actions: [{ type: 'attack', name: '体当たり', rate: 50 }, { type: 'fire', name: '怪火', rate: 50, power: 1.2 }] },
    ittanmomen: { id: 'ittanmomen', name: '一反木綿', maxHp: 46, hp: 46, atk: 17, def: 8, spd: 18, exp: 22, money: 22, spriteKey: 'ittanmomen', actions: [{ type: 'attack', name: '巻き付き', rate: 60 }, { type: 'wind', name: 'かまいたち', rate: 40, power: 1.3 }] },
    tanuki: { id: 'tanuki', name: '化け狸', maxHp: 50, hp: 50, atk: 16, def: 10, spd: 10, exp: 25, money: 30, spriteKey: 'tanuki', actions: [{ type: 'attack', name: '腹鼓', rate: 60 }, { type: 'leaf', name: '木の葉隠れ', rate: 40, power: 1.2 }] },
    kitsunebi: { id: 'kitsunebi', name: '狐火', maxHp: 35, hp: 35, atk: 18, def: 4, spd: 16, exp: 20, money: 15, spriteKey: 'kitsunebi', actions: [{ type: 'fire', name: '青炎弾', rate: 70, power: 1.3 }, { type: 'attack', name: '燐光', rate: 30 }] },
    rokurokubi: { id: 'rokurokubi', name: 'ろくろ首', maxHp: 58, hp: 58, atk: 20, def: 9, spd: 14, exp: 32, money: 35, spriteKey: 'rokurokubi', actions: [{ type: 'attack', name: '首締め', rate: 60 }, { type: 'curse', name: '怨みの眼差し', rate: 40, power: 1.3 }] },
    wanyudo: { id: 'wanyudo', name: '輪入道', maxHp: 65, hp: 65, atk: 22, def: 12, spd: 13, exp: 40, money: 42, spriteKey: 'wanyudo', actions: [{ type: 'attack', name: '火車突進', rate: 50 }, { type: 'fire', name: '焦熱地獄', rate: 50, power: 1.4 }] },
    kappa: { id: 'kappa', name: '河童', maxHp: 54, hp: 54, atk: 19, def: 11, spd: 15, exp: 30, money: 28, spriteKey: 'kappa', actions: [{ type: 'attack', name: '皿水鉄砲', rate: 60 }, { type: 'water', name: '尻子玉抜き', rate: 40, power: 1.3 }] },
    nurikabe: { id: 'nurikabe', name: 'ぬりかべ', maxHp: 90, hp: 90, atk: 18, def: 20, spd: 5, exp: 45, money: 40, spriteKey: 'nurikabe', actions: [{ type: 'attack', name: '倒れ込み', rate: 70 }, { type: 'defend', name: '鉄壁の構え', rate: 30 }] },
    kamaitachi: { id: 'kamaitachi', name: '鎌鼬', maxHp: 52, hp: 52, atk: 24, def: 8, spd: 25, exp: 38, money: 36, spriteKey: 'kamaitachi', actions: [{ type: 'attack', name: '三連刃', rate: 60 }, { type: 'wind', name: '突風斬', rate: 40, power: 1.4 }] },
    dorotabo: { id: 'dorotabo', name: '泥田坊', maxHp: 68, hp: 68, atk: 21, def: 13, spd: 7, exp: 36, money: 32, spriteKey: 'dorotabo', actions: [{ type: 'attack', name: '泥投げ', rate: 60 }, { type: 'curse', name: '田を返せ！', rate: 40, power: 1.2 }] },
    akaname: { id: 'akaname', name: '垢嘗', maxHp: 44, hp: 44, atk: 16, def: 8, spd: 13, exp: 24, money: 20, spriteKey: 'akaname', actions: [{ type: 'attack', name: '長舌打', rate: 70 }, { type: 'poison', name: '猛毒唾液', rate: 30, power: 1.2 }] },
    kodama: { id: 'kodama', name: '木霊', maxHp: 38, hp: 38, atk: 14, def: 12, spd: 16, exp: 28, money: 25, spriteKey: 'kodama', actions: [{ type: 'attack', name: '葉っぱカッター', rate: 60 }, { type: 'heal', name: '森の癒し', rate: 40, power: 30 }] },
    tsurube: { id: 'tsurube', name: '釣瓶落とし', maxHp: 62, hp: 62, atk: 26, def: 10, spd: 11, exp: 42, money: 38, spriteKey: 'tsurube', actions: [{ type: 'attack', name: '頭上急降下', rate: 70, power: 1.5 }, { type: 'laugh', name: '夜叉の哄笑', rate: 30 }] },
    nue: { id: 'nue', name: '鵺', maxHp: 85, hp: 85, atk: 28, def: 14, spd: 19, exp: 60, money: 65, spriteKey: 'nue', actions: [{ type: 'attack', name: '黒煙の爪', rate: 50 }, { type: 'thunder', name: '怪鳥の啼声', rate: 50, power: 1.5 }] },
    nekomata: { id: 'nekomata', name: '猫又', maxHp: 56, hp: 56, atk: 23, def: 9, spd: 22, exp: 35, money: 35, spriteKey: 'nekomata', actions: [{ type: 'attack', name: '二尾連撃', rate: 60 }, { type: 'fire', name: '鬼火の舞', rate: 40, power: 1.3 }] },
    zashiki: { id: 'zashiki', name: '座敷童子', maxHp: 48, hp: 48, atk: 15, def: 14, spd: 17, exp: 50, money: 80, spriteKey: 'zashiki', actions: [{ type: 'attack', name: '鞠投げ', rate: 50 }, { type: 'luck', name: '福授け', rate: 50 }] },
    mushakage: { id: 'mushakage', name: '武者影', maxHp: 78, hp: 78, atk: 27, def: 16, spd: 12, exp: 55, money: 50, spriteKey: 'mushakage', actions: [{ type: 'attack', name: '亡霊抜刀', rate: 60, power: 1.4 }, { type: 'slash', name: '鎧断ち', rate: 40, power: 1.3 }] },
    hyakume: { id: 'hyakume', name: '百目', maxHp: 82, hp: 82, atk: 25, def: 15, spd: 10, exp: 58, money: 55, spriteKey: 'hyakume', actions: [{ type: 'attack', name: '百眼光線', rate: 50, power: 1.4 }, { type: 'curse', name: '凝視の呪い', rate: 50 }] },
    gaki: { id: 'gaki', name: '餓鬼', maxHp: 46, hp: 46, atk: 20, def: 6, spd: 15, exp: 26, money: 18, spriteKey: 'gaki', actions: [{ type: 'attack', name: '骨齧り', rate: 70 }, { type: 'drain', name: '貪欲な噛みつき', rate: 30, power: 1.2 }] },

    // 第二章魔物 (15種)
    yukionna_mob: { id: 'yukionna_mob', name: '雪女', maxHp: 75, hp: 75, atk: 26, def: 12, spd: 16, exp: 70, money: 60, spriteKey: 'yukionna_mob', actions: [{ type: 'blizzard', name: '凍てつく吐息', rate: 60, power: 1.3 }, { type: 'attack', name: '氷爪', rate: 40 }] },
    hyouro: { id: 'hyouro', name: '氷狼', maxHp: 68, hp: 68, atk: 29, def: 11, spd: 22, exp: 65, money: 55, spriteKey: 'hyouro', actions: [{ type: 'attack', name: '氷牙噛み', rate: 70, power: 1.3 }, { type: 'blizzard', name: '冷気遠吠え', rate: 30 }] },
    yukiwarashi: { id: 'yukiwarashi', name: '雪童子', maxHp: 52, hp: 52, atk: 22, def: 14, spd: 18, exp: 58, money: 50, spriteKey: 'yukiwarashi', actions: [{ type: 'attack', name: '雪つぶて', rate: 60 }, { type: 'blizzard', name: '吹雪の舞', rate: 40 }] },
    umibozu: { id: 'umibozu', name: '海坊主', maxHp: 110, hp: 110, atk: 30, def: 18, spd: 8, exp: 90, money: 85, spriteKey: 'umibozu', actions: [{ type: 'water', name: '大波打ち', rate: 60, power: 1.4 }, { type: 'attack', name: '怪力呑み込み', rate: 40 }] },
    funayurei: { id: 'funayurei', name: '舟幽霊', maxHp: 62, hp: 62, atk: 25, def: 10, spd: 15, exp: 68, money: 62, spriteKey: 'funayurei', actions: [{ type: 'water', name: '柄杓の水注ぎ', rate: 60, power: 1.3 }, { type: 'curse', name: '底沈みの呪い', rate: 40 }] },
    ushioni: { id: 'ushioni', name: '牛鬼', maxHp: 120, hp: 120, atk: 34, def: 20, spd: 10, exp: 110, money: 100, spriteKey: 'ushioni', actions: [{ type: 'attack', name: '猛毒角突き', rate: 60, power: 1.4 }, { type: 'poison', name: '毒煙霧', rate: 40 }] },
    suiko: { id: 'suiko', name: '水虎', maxHp: 72, hp: 72, atk: 28, def: 13, spd: 19, exp: 75, money: 70, spriteKey: 'suiko', actions: [{ type: 'attack', name: '虎水爪', rate: 60 }, { type: 'water', name: '激流弾', rate: 40, power: 1.3 }] },
    nureonna: { id: 'nureonna', name: '濡女', maxHp: 80, hp: 80, atk: 27, def: 12, spd: 17, exp: 80, money: 75, spriteKey: 'nureonna', actions: [{ type: 'attack', name: '大蛇締め', rate: 50, power: 1.3 }, { type: 'curse', name: '金縛りの視線', rate: 50 }] },
    isoonna: { id: 'isoonna', name: '磯女', maxHp: 70, hp: 70, atk: 26, def: 11, spd: 18, exp: 72, money: 68, spriteKey: 'isoonna', actions: [{ type: 'attack', name: '潮風斬', rate: 60 }, { type: 'drain', name: '生気吸い', rate: 40, power: 1.2 }] },
    yamauba: { id: 'yamauba', name: '山姥', maxHp: 88, hp: 88, atk: 32, def: 14, spd: 14, exp: 85, money: 80, spriteKey: 'yamauba', actions: [{ type: 'attack', name: '包丁研ぎ斬り', rate: 60, power: 1.4 }, { type: 'curse', name: '怪声威嚇', rate: 40 }] },
    aobozu: { id: 'aobozu', name: '青坊主', maxHp: 95, hp: 95, atk: 30, def: 16, spd: 11, exp: 88, money: 82, spriteKey: 'aobozu', actions: [{ type: 'attack', name: '巨杖殴打', rate: 60 }, { type: 'curse', name: '青炎呪縛', rate: 40, power: 1.3 }] },
    yasha: { id: 'yasha', name: '夜叉', maxHp: 105, hp: 105, atk: 36, def: 15, spd: 21, exp: 120, money: 110, spriteKey: 'yasha', actions: [{ type: 'attack', name: '阿修羅連撃', rate: 60, power: 1.5 }, { type: 'fire', name: '業火烈風', rate: 40, power: 1.4 }] },
    ichimoku: { id: 'ichimoku', name: '一目入道', maxHp: 85, hp: 85, atk: 28, def: 15, spd: 12, exp: 78, money: 70, spriteKey: 'ichimoku', actions: [{ type: 'attack', name: '独眼光弾', rate: 60, power: 1.3 }, { type: 'wind', name: '砂塵旋風', rate: 40 }] },
    kagebozu: { id: 'kagebozu', name: '影坊主', maxHp: 65, hp: 65, atk: 31, def: 9, spd: 24, exp: 82, money: 76, spriteKey: 'kagebozu', actions: [{ type: 'attack', name: '影刃奇襲', rate: 70, power: 1.4 }, { type: 'curse', name: '影潜み', rate: 30 }] },
    mizuchi_mob: { id: 'mizuchi_mob', name: '水蛇精', maxHp: 76, hp: 76, atk: 29, def: 13, spd: 18, exp: 84, money: 78, spriteKey: 'mizuchi_mob', actions: [{ type: 'water', name: '水神毒牙', rate: 60, power: 1.3 }, { type: 'attack', name: '流水尾撃', rate: 40 }] },

    // 第三章魔物 (15種)
    gashadokuro: { id: 'gashadokuro', name: 'がしゃどくろ', maxHp: 150, hp: 150, atk: 42, def: 24, spd: 8, exp: 160, money: 140, spriteKey: 'gashadokuro', actions: [{ type: 'attack', name: '巨骨粉砕', rate: 60, power: 1.5 }, { type: 'curse', name: '怨嗟の軋み', rate: 40 }] },
    tsuchigumo: { id: 'tsuchigumo', name: '土蜘蛛', maxHp: 130, hp: 130, atk: 38, def: 18, spd: 18, exp: 140, money: 120, spriteKey: 'tsuchigumo', actions: [{ type: 'attack', name: '千筋糸縛り', rate: 50, power: 1.3 }, { type: 'poison', name: '蜘蛛毒針', rate: 50, power: 1.4 }] },
    kyokotsu: { id: 'kyokotsu', name: '狂骨', maxHp: 95, hp: 95, atk: 35, def: 12, spd: 20, exp: 125, money: 110, spriteKey: 'kyokotsu', actions: [{ type: 'attack', name: '井戸底の叫び', rate: 60, power: 1.4 }, { type: 'curse', name: '狂乱の呪詛', rate: 40 }] },
    onmoraki: { id: 'onmoraki', name: '陰摩羅鬼', maxHp: 100, hp: 100, atk: 37, def: 14, spd: 22, exp: 135, money: 115, spriteKey: 'onmoraki', actions: [{ type: 'fire', name: '黒炎ブレス', rate: 60, power: 1.4 }, { type: 'attack', name: '怪鳥鉤爪', rate: 40 }] },
    gozuki: { id: 'gozuki', name: '牛頭鬼', maxHp: 160, hp: 160, atk: 44, def: 22, spd: 12, exp: 170, money: 150, spriteKey: 'gozuki', actions: [{ type: 'attack', name: '地獄大斧', rate: 70, power: 1.6 }, { type: 'roar', name: '黄泉咆哮', rate: 30 }] },
    mezuki: { id: 'mezuki', name: '馬頭鬼', maxHp: 145, hp: 145, atk: 41, def: 20, spd: 19, exp: 165, money: 145, spriteKey: 'mezuki', actions: [{ type: 'attack', name: '鬼槍連突', rate: 60, power: 1.5 }, { type: 'fire', name: '獄炎火焔', rate: 40, power: 1.4 }] },
    oboroguruma: { id: 'oboroguruma', name: '朧車', maxHp: 140, hp: 140, atk: 39, def: 25, spd: 11, exp: 155, money: 130, spriteKey: 'oboroguruma', actions: [{ type: 'attack', name: '巨大面圧殺', rate: 60, power: 1.5 }, { type: 'curse', name: '怨念の煙', rate: 40 }] },
    hyakki_soldier: { id: 'hyakki_soldier', name: '百鬼夜行兵', maxHp: 115, hp: 115, atk: 36, def: 16, spd: 16, exp: 130, money: 120, spriteKey: 'hyakki_soldier', actions: [{ type: 'attack', name: '乱れ鬼刀', rate: 70, power: 1.4 }, { type: 'fire', name: '鬼火投げ', rate: 30 }] },
    jashinkyo: { id: 'jashinkyo', name: '邪神鏡', maxHp: 90, hp: 90, atk: 32, def: 28, spd: 14, exp: 145, money: 135, spriteKey: 'jashinkyo', actions: [{ type: 'holy', name: '暗黒反射光', rate: 60, power: 1.5 }, { type: 'curse', name: '呪縛の鏡面', rate: 40 }] },
    yashahime: { id: 'yashahime', name: '夜叉姫', maxHp: 125, hp: 125, atk: 43, def: 17, spd: 25, exp: 180, money: 160, spriteKey: 'yashahime', actions: [{ type: 'slash', name: '桜花乱舞斬', rate: 60, power: 1.6 }, { type: 'curse', name: '誘惑の妖香', rate: 40 }] },
    yomishikome: { id: 'yomishikome', name: '黄泉醜女', maxHp: 110, hp: 110, atk: 40, def: 15, spd: 26, exp: 150, money: 125, spriteKey: 'yomishikome', actions: [{ type: 'attack', name: '狂乱の爪', rate: 70, power: 1.4 }, { type: 'curse', name: '黄泉の叫喚', rate: 30 }] },
    ibaraki_soldier: { id: 'ibaraki_soldier', name: '茨木鬼兵', maxHp: 135, hp: 135, atk: 42, def: 19, spd: 15, exp: 160, money: 140, spriteKey: 'ibaraki_soldier', actions: [{ type: 'attack', name: '金棒砕き', rate: 60, power: 1.5 }, { type: 'fire', name: '鬼炎乱舞', rate: 40, power: 1.3 }] },
    nue_mutant: { id: 'nue_mutant', name: '鵺・変異種', maxHp: 160, hp: 160, atk: 45, def: 20, spd: 23, exp: 195, money: 180, spriteKey: 'nue_mutant', actions: [{ type: 'thunder', name: '紫電雷鳴波', rate: 50, power: 1.6 }, { type: 'attack', name: '邪爪連撃', rate: 50, power: 1.4 }] },
    tokoyo_guard: { id: 'tokoyo_guard', name: '常夜の番人', maxHp: 170, hp: 170, atk: 46, def: 24, spd: 17, exp: 210, money: 200, spriteKey: 'tokoyo_guard', actions: [{ type: 'curse', name: '常夜の冥鎖', rate: 50, power: 1.5 }, { type: 'attack', name: '冥府の大鎌', rate: 50, power: 1.6 }] },
    tamamo_fox: { id: 'tamamo_fox', name: '玉藻の妖狐', maxHp: 120, hp: 120, atk: 44, def: 18, spd: 24, exp: 200, money: 220, spriteKey: 'tamamo_fox', actions: [{ type: 'fire', name: '九尾の残り火', rate: 60, power: 1.6 }, { type: 'curse', name: '幻影惑わし', rate: 40 }] },

    // ボスキャラ (全9体)
    akaoni: { id: 'akaoni', name: '赤鬼・羅刹', maxHp: 180, hp: 180, atk: 28, def: 14, spd: 10, exp: 150, money: 200, spriteKey: 'akaoni', isBoss: true, actions: [{ type: 'attack', name: '金棒叩き割り', rate: 40, power: 1.4 }, { type: 'fire', name: '鬼気咆哮', rate: 35, power: 1.3 }, { type: 'attack', name: '剛腕薙ぎ払い', rate: 25, power: 1.2 }] },
    tengu: { id: 'tengu', name: '大天狗・疾風坊', maxHp: 210, hp: 210, atk: 32, def: 15, spd: 24, exp: 220, money: 300, spriteKey: 'tengu', isBoss: true, actions: [{ type: 'wind', name: '天狗団扇の大嵐', rate: 45, power: 1.5 }, { type: 'attack', name: '神速羽撃き', rate: 35, power: 1.3 }, { type: 'curse', name: '神通力縛り', rate: 20, power: 1.2 }] },
    youko: { id: 'youko', name: '九尾の妖狐・茜', maxHp: 280, hp: 280, atk: 36, def: 18, spd: 18, exp: 350, money: 500, spriteKey: 'youko', isBoss: true, actions: [{ type: 'attack', name: '妖爪の一撃', rate: 30 }, { type: 'foxfire', name: '妖狐の紅蓮火', rate: 45, power: 1.6 }, { type: 'curse', name: '常夜の呪詛', rate: 25, power: 1.4 }] },

    hyoka: { id: 'hyoka', name: '雪女・氷華', maxHp: 320, hp: 320, atk: 38, def: 18, spd: 20, exp: 420, money: 600, spriteKey: 'boss_hyoka', isBoss: true, actions: [{ type: 'blizzard', name: '絶対零度の吹雪', rate: 45, power: 1.5 }, { type: 'ice_spear', name: '氷華千本槍', rate: 35, power: 1.4 }, { type: 'curse', name: '凍てつく哀傷', rate: 20, power: 1.2 }] },
    mizuchi_boss: { id: 'mizuchi_boss', name: '水神・蛟龍', maxHp: 380, hp: 380, atk: 42, def: 22, spd: 16, exp: 550, money: 800, spriteKey: 'boss_mizuchi', isBoss: true, actions: [{ type: 'water', name: '神仙大激流', rate: 45, power: 1.6 }, { type: 'attack', name: '神竜尾撃', rate: 35, power: 1.3 }, { type: 'roar', name: '水神の咆哮', rate: 20, power: 1.2 }] },
    shuten: { id: 'shuten', name: '妖魔将・酒呑童子', maxHp: 460, hp: 460, atk: 48, def: 25, spd: 18, exp: 750, money: 1200, spriteKey: 'boss_shuten', isBoss: true, actions: [{ type: 'slash_heavy', name: '鬼切丸・断頭斬', rate: 40, power: 1.7 }, { type: 'fire', name: '鬼火酒乱れ吹き', rate: 35, power: 1.5 }, { type: 'buff_self', name: '剛力百倍の盃', rate: 25, power: 1.4 }] },

    ibaraki: { id: 'ibaraki', name: '鬼将・茨木童子', maxHp: 520, hp: 520, atk: 52, def: 26, spd: 22, exp: 950, money: 1500, spriteKey: 'boss_ibaraki', isBoss: true, actions: [{ type: 'dark_slash', name: '暗黒鬼腕斬', rate: 45, power: 1.8 }, { type: 'fire', name: '羅生門の劫火', rate: 35, power: 1.5 }, { type: 'curse', name: '怨念の縛り', rate: 20, power: 1.3 }] },
    musokage: { id: 'musokage', name: '亡霊剣聖・無想影', maxHp: 580, hp: 580, atk: 58, def: 28, spd: 28, exp: 1200, money: 2000, spriteKey: 'boss_musokage', isBoss: true, actions: [{ type: 'slash_heavy', name: '真・風塵絶命剣', rate: 50, power: 2.0 }, { type: 'tornado', name: '神速竜巻刃', rate: 30, power: 1.6 }, { type: 'buff_self', name: '無想の極意', rate: 20, power: 1.5 }] },
    shin_youko: { id: 'shin_youko', name: '真・九尾の天狐・茜', maxHp: 750, hp: 750, atk: 65, def: 32, spd: 25, exp: 3000, money: 5000, spriteKey: 'boss_shin_youko', isBoss: true, actions: [{ type: 'foxfire', name: '天変地異・九曜紅蓮火', rate: 35, power: 2.2 }, { type: 'curse', name: '千年の怨嗟・常夜の門', rate: 30, power: 1.8 }, { type: 'thunder', name: '神変万化・紫電天誅', rate: 20, power: 1.9 }, { type: 'holy_pillar', name: '天狐の神光', rate: 15, power: 2.0 }] }
  },

  // エリア別エンカウントテーブル
  encounters: {
    plains: [{ enemies: ['karakasa', 'chochin'], weight: 35 }, { enemies: ['tanuki', 'akaname'], weight: 35 }, { enemies: ['kitsunebi', 'kodama'], weight: 30 }],
    bamboo: [{ enemies: ['kamaitachi', 'ittanmomen'], weight: 35 }, { enemies: ['kappa', 'dorotabo'], weight: 35 }, { enemies: ['rokurokubi', 'nekomata'], weight: 30 }],
    forest: [{ enemies: ['wanyudo', 'nurikabe'], weight: 30 }, { enemies: ['tsurube', 'gaki'], weight: 35 }, { enemies: ['mushakage', 'hyakume'], weight: 35 }],
    deep_forest: [{ enemies: ['nue', 'mushakage'], weight: 40 }, { enemies: ['wanyudo', 'hyakume'], weight: 30 }, { enemies: ['nue', 'zashiki'], weight: 30 }],

    snow_mountain: [{ enemies: ['yukionna_mob', 'hyouro'], weight: 40 }, { enemies: ['yukiwarashi', 'yamauba'], weight: 35 }, { enemies: ['hyouro', 'yukiwarashi'], weight: 25 }],
    lake_underwater: [{ enemies: ['umibozu', 'funayurei'], weight: 35 }, { enemies: ['suiko', 'nureonna'], weight: 35 }, { enemies: ['ushioni', 'mizuchi_mob'], weight: 30 }],
    port_coast: [{ enemies: ['isoonna', 'aobozu'], weight: 35 }, { enemies: ['yasha', 'ichimoku'], weight: 35 }, { enemies: ['kagebozu', 'funayurei'], weight: 30 }],

    capital_street: [{ enemies: ['gashadokuro', 'tsuchigumo'], weight: 35 }, { enemies: ['hyakki_soldier', 'oboroguruma'], weight: 35 }, { enemies: ['kyokotsu', 'onmoraki'], weight: 30 }],
    rashomon_gate: [{ enemies: ['gozuki', 'mezuki'], weight: 35 }, { enemies: ['ibaraki_soldier', 'yashahime'], weight: 35 }, { enemies: ['nue_mutant', 'jashinkyo'], weight: 30 }],
    tokoyo_corridor: [{ enemies: ['tokoyo_guard', 'tamamo_fox'], weight: 40 }, { enemies: ['yomishikome', 'tokoyo_guard'], weight: 35 }, { enemies: ['tamamo_fox', 'nue_mutant'], weight: 25 }]
  },

  // 街人・NPCデータ (全17名)
  npcs: [
    { id: 'elder', chapter: 1, name: '村長（むらおさ）', x: 12, y: 10, spriteKey: 'npc_elder', messages: ['疾風殿、小夜殿、朧殿……よくぞ参られた。', '常夜の瘴気により森の妖怪たちが狂暴化しておる。東の古社の妖狐を鎮めてくだされ！'] },
    { id: 'chaya_girl', chapter: 1, name: '看板娘・お花', x: 18, y: 14, spriteKey: 'npc_ohana', messages: ['特製のきび団子とお茶ですよ！\n（お団子を食べて全員のHP・MPが全回復した！）'], healParty: true },
    { id: 'priest', chapter: 1, name: '神主', x: 35, y: 8, spriteKey: 'npc_kannushi', messages: ['白鷺神社の神気がそなたらを包んでおります。奥の賽銭箱で記録（セーブ）できますぞ。'] },
    { id: 'smith', chapter: 1, name: '鍛冶屋・源蔵', x: 8, y: 18, spriteKey: 'npc_smith_genzo', messages: ['刃を研ぎ澄ました剛剣と、破魔術、忍術を合わせるのが一番効くぜ！'] },
    { id: 'boy', chapter: 1, name: 'わんぱく小僧・太一', x: 15, y: 22, spriteKey: 'npc_taichi', messages: ['東の森の奥には金色の狐の光が見えるんだよ！'] },
    { id: 'merchant', chapter: 1, name: '行商人・甚兵衛', x: 22, y: 18, spriteKey: 'npc_merchant_jinbei', messages: ['竹林の先には赤鬼が居座って旅人を通さねえとか……気をつけてくだせえ！'] },
    { id: 'grandma', chapter: 1, name: 'おばあちゃん・よね', x: 7, y: 26, spriteKey: 'npc_yone', messages: ['小夜ちゃんの瞳は、昔この里を救った狐の神様とそっくりじゃ……。'] },
    { id: 'apprentice_miko', chapter: 1, name: '見習い巫女・すず', x: 38, y: 11, spriteKey: 'npc_suzu', messages: ['小夜先輩！どうか村のみんなを悪い妖怪から守ってくださいね！'] },
    { id: 'shadow_scout', chapter: 1, name: '密偵・影丸', x: 28, y: 25, spriteKey: 'npc_kagemaru', messages: ['常夜の門の封印を解こうとしているのは、かつて人に裏切られた大妖狐・茜に間違いありませぬ。'] },
    { id: 'biwa_monk', chapter: 1, name: '琵琶法師・幽玄', x: 25, y: 9, spriteKey: 'npc_yugen', messages: ['怨みと悲しみの連鎖を断ち切るは、剛剣のみにあらず、清き心なり……。'] },

    { id: 'captain', chapter: 2, name: '船頭・長兵衛', x: 14, y: 16, spriteKey: 'npc_chobei', messages: ['北の「霊峰白嶺」には『八咫の鏡』が、南の「神仙湖」には『八尺瓊勾玉』が眠るというぜ！', '二つの神具を揃えれば、帝都・羅生門へ船を出してやるよ！'] },
    { id: 'inn_keeper', chapter: 2, name: '湊の女将・お志乃', x: 20, y: 12, spriteKey: 'npc_oshino', messages: ['不知火の湊へようこそ！ 名物の海鮮鍋で温まっておくんなまし！\n（温かい鍋を食べて全員のHP・MPが全回復した！）'], healParty: true },
    { id: 'onmyoji', chapter: 2, name: '旅の陰陽師・蘆屋', x: 25, y: 10, spriteKey: 'npc_ashiya', messages: ['神仙湖の底には太古の神殿が存在する。八咫の鏡の光翳せば、湖水が割れて道が開くであろう。'] },
    { id: 'fisherman', chapter: 2, name: '漁師の勘助', x: 10, y: 22, spriteKey: 'npc_kansuke', messages: ['近頃、海にも山にも見たこともねえ凶暴な妖怪が増えて漁に出られねえんだ……！'] },

    { id: 'onmyo_head', chapter: 3, name: '陰陽頭・安倍', x: 12, y: 14, spriteKey: 'npc_abe', messages: ['皆既月蝕の闇が帝都を覆っております。南の羅生門を抜け、常夜の門を封じてくださりませ！', '（安倍の陰陽術により全員のHP・MPが全回復した！）'], healParty: true },
    { id: 'princess', chapter: 3, name: '藤原の姫君', x: 18, y: 10, spriteKey: 'npc_hime', messages: ['どうか茜様の魂をお救いください……。あの方もまた、かつては都を守る守護神だったのです……。'] },
    { id: 'guard_captain', chapter: 3, name: '帝都衛士頭', x: 8, y: 20, spriteKey: 'npc_guardsman', messages: ['羅生門の先は常夜の回廊……生きて戻った者は誰一人おらぬ！ 覚悟を決めて進め！'] }
  ],

  // ボス対峙イベント
  bossEvents: {
    akaoni: { speaker: '赤鬼・羅刹', messages: ['グオオオオ！ 常夜の瘴気が我に力を与えてくれるのだ！\n我が金棒のサビにしてくれるわッ！！'] },
    tengu: { speaker: '大天狗・疾風坊', messages: ['我ら天狗の羽団扇が巻き起こす神速の大嵐、\n貴様らの剣と術で耐えきれるかな！？'] },
    youko: { speaker: '九尾の妖狐・茜', messages: ['我が名は茜……千年の時を経て、今ふたたび現世を常夜の闇へ還す者なり！\n我を裏切った人間の末裔め、その身に積年の怨嗟を焼き付けるがよい！！'] },

    hyoka: { speaker: '雪女・氷華', messages: ['立ち去りなさい……人の温もりなど、この絶対零度の霊峰には不要……。', '八咫の鏡は、誰にも渡さない……！'] },
    mizuchi_boss: { speaker: '水神・蛟龍', messages: ['グルオオオオ！ 我が聖域を侵す不届き者どもめ！', '常夜の瘴気と共に、怒りの大津波に呑まれるがよい！！'] },
    shuten: { speaker: '妖魔将・酒呑童子', messages: ['ハハハ！ ようやったわ人間ども！ 八咫の鏡と勾玉、茜様のためにそっくりいただくぜ！', '俺の剛刀・鬼切丸の切れ味、骨まで味わいなァ！！'] },

    ibaraki: { speaker: '鬼将・茨木童子', messages: ['酒呑の兄貴を討った人間どもだな！ この羅生門より先は茜様の領域！', '我が暗黒の鬼腕で八つ裂きにしてくれるわッ！！'] },
    musokage: { speaker: '亡霊剣聖・無想影', messages: ['疾風よ……剣に迷いがある者に、この草薙の剣を抜く資格はない。', '我を斬り、己の迷いを断ち切ってみせよ！'] },
    shin_youko: { speaker: '真・九尾の天狐・茜', messages: ['すべては遅すぎた……。皆既月蝕の闇は満ち、常夜の門は今まさに開かれん！', '偽りの現世を滅ぼし、我が永遠の楽土を築くのだ！！'] }
  },

  // 章定義配列 (CHAPTERS)
  chapters: [
    {
      id: 1,
      name: '第一章: 神楽の里と妖しの森',
      start: { x: 12, y: 14, facing: 'down' },
      savePoint: { x: 36, y: 5 },
      revive: { x: 36, y: 8, facing: 'down' },
      bosses: [
        { id: 'akaoni', area: { x1: 33, y1: 39, x2: 35, y2: 41 } },
        { id: 'tengu', area: { x1: 51, y1: 29, x2: 53, y2: 31 } },
        { id: 'youko', area: { x1: 63, y1: 20, x2: 66, y2: 24 } }
      ]
    },
    {
      id: 2,
      name: '第二章: 霊峰白嶺と湖底神殿',
      start: { x: 14, y: 18, facing: 'down' },
      savePoint: { x: 25, y: 12 },
      revive: { x: 20, y: 14, facing: 'down' },
      bosses: [
        { id: 'hyoka', area: { x1: 48, y1: 5, x2: 52, y2: 7 } },
        { id: 'mizuchi_boss', area: { x1: 42, y1: 33, x2: 46, y2: 37 } },
        { id: 'shuten', area: { x1: 62, y1: 22, x2: 66, y2: 26 } }
      ]
    },
    {
      id: 3,
      name: '第三章: 魔都羅生門と常夜の門',
      start: { x: 10, y: 24, facing: 'down' },
      savePoint: { x: 20, y: 12 },
      revive: { x: 12, y: 16, facing: 'down' },
      bosses: [
        { id: 'ibaraki', area: { x1: 30, y1: 22, x2: 34, y2: 26 } },
        { id: 'musokage', area: { x1: 46, y1: 22, x2: 50, y2: 26 } },
        { id: 'shin_youko', area: { x1: 62, y1: 22, x2: 66, y2: 26 } }
      ]
    }
  ]
});

/**
 * 章の解放状態を判定（新規セーブ項目を設けずStateから直接導出）
 * @param {number} chapterId 
 * @param {import('./GameState.js').GameState} state 
 * @returns {boolean}
 */
export function isChapterUnlocked(chapterId, state) {
  if (chapterId === 1) return true;
  if (chapterId === 2) {
    return !!state.bossDefeated.youko;
  }
  if (chapterId === 3) {
    return !!(state.bossDefeated.shuten && state.artifacts.mirror && state.artifacts.magatama);
  }
  return false;
}
