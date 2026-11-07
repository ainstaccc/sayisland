# -*- coding: utf-8 -*-
"""說說島｜預錄語音產生器（可在 Stacy 的電腦執行；雲端要先在 claude.ai 允許網域加 speech.platform.bing.com，程式會自動走環境的 HTTPS_PROXY）。
讀 items.json → 用微軟台灣語音（edge-tts）合成 mp3 → 存到 audio/sp/ → 更新 audio/manifest.js。
用法：雙擊 start.bat，或  python gen_audio.py [--voice zh-TW-HsiaoChenNeural] [--rate -5] [--pitch 0] [--force] [--only 4]
"""
import argparse, asyncio, datetime, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
# 放在 repo 的 tools/tts/ 裡就寫進 repo 根目錄；單獨一包（zip）時寫在這個資料夾旁邊
ROOT = os.path.abspath(os.path.join(HERE, "..", "..")) if os.path.exists(os.path.join(HERE, "..", "..", "index.html")) else HERE
VOICES = {"曉臻": "zh-TW-HsiaoChenNeural", "曉雨": "zh-TW-HsiaoYuNeural", "雲哲": "zh-TW-YunJheNeural"}


def synth(text, voice, rate, pitch, out):
    import edge_tts

    async def go():
        px = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")  # 雲端環境需走代理；PC 沒設就直連
        kw = {"proxy": px} if px else {}
        await edge_tts.Communicate(text, voice, rate="%+d%%" % rate, pitch="%+dHz" % pitch, **kw).save(out)

    asyncio.run(go())


def write_manifest(items):
    have = {x["key"]: x["file"] for x in items if os.path.exists(os.path.join(ROOT, x["file"]))}
    os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
    # 格式要和 tools/tts/build_manifest.js 完全一樣（node tools/tts/build_manifest.js --check 會比對）
    with open(os.path.join(ROOT, "audio", "manifest.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("window.PREAUD=" + json.dumps(have, ensure_ascii=False, separators=(",", ":")) + ";\n")
    return len(have)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="曉臻", help="曉臻／曉雨／雲哲，或完整聲音代號（預設曉臻）")
    ap.add_argument("--rate", type=int, default=-5, help="語速 %%，負的比較慢（預設 -5，給小朋友聽稍慢一點）")
    ap.add_argument("--pitch", type=int, default=0, help="音調 Hz（預設 0）")
    ap.add_argument("--force", action="store_true", help="已經有的音檔也重新產生")
    ap.add_argument("--only", type=int, help="只產生第 N 題（題號見 items.json 的 q）")
    a = ap.parse_args()
    voice = VOICES.get(a.voice, a.voice)

    items = json.load(open(os.path.join(HERE, "items.json"), encoding="utf-8"))
    todo = [x for x in items if (a.only is None or x["q"] == a.only)]
    os.makedirs(os.path.join(ROOT, "audio", "sp"), exist_ok=True)
    ok = skip = bad = 0
    for i, x in enumerate(todo, 1):
        path = os.path.join(ROOT, x["file"])
        if os.path.exists(path) and not a.force:
            skip += 1; continue
        for k in range(3):
            try:
                synth(x["speak"], voice, a.rate, a.pitch, path)
                if os.path.getsize(path) < 500: raise RuntimeError("音檔太小，可能沒有合成成功")
                print("[%d/%d] 第%d題 %s  OK  %s" % (i, len(todo), x["q"], x["kind"], x["speak"])); ok += 1; break
            except Exception as e:
                print("   第 %d 次失敗：%s" % (k + 1, e))
                if os.path.exists(path): os.remove(path)
                time.sleep(2)
        else:
            bad += 1; print("[%d/%d] 第%d題 %s  失敗，之後再按一次會補" % (i, len(todo), x["q"], x["kind"]))
    if ok:
        with open(os.path.join(ROOT, "audio", "sp", "_voice.txt"), "w", encoding="utf-8") as f:
            f.write("voice=%s rate=%+d%% pitch=%+dHz date=%s\n" % (voice, a.rate, a.pitch, datetime.date.today()))
    n = write_manifest(items)
    print("\n完成：新產生 %d、略過（已有）%d、失敗 %d。audio/manifest.js 目前有 %d 句。" % (ok, skip, bad, n))
    print("音檔在：" + os.path.join(ROOT, "audio", "sp"))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
