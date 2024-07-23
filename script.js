const prgBar = document.getElementById("prg_bar");
const stat = document.getElementById("status");
const outputText = document.getElementById("output_text");
const start = document.getElementById("start");
const restart = document.getElementById("restart");
const seconds = document.getElementById("sec");

let texts = "";
let text = "";
let inputText = "";
let num;
let input;
let match;
let miss;
let count;
let correct;
let timeNum;
let timer;
let sec;
let limit;

num = 0;
input = 0;
match = 0;
miss = 0;
count = 0;
correct = 0;
timeNum = parseInt(seconds.value);
sec = timeNum;
timer = null;

// 初期ステータスの表示
stat.textContent = `得点 : ${count} タイプミス : ${miss} 残り時間 : ${timeNum} 秒`;

// タイピングテキストを取得
fetch("text.json")
    .then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new error("ファイルが存在しません。");
    })
    .then((data) => {
        texts = data["text_list"];
    })
    .catch((error) => {
        window.alert(error.message);
    });

/**
 * 単語を一文字ずつspanタグで作成
 * @param string text 単語
 * @returns spanタグ一覧
 */
const spanText = (text) => {
    return [...text].map((char) => `<span>${char}</span>`).join("");
};

/**
 * テキスト一覧からランダムに単語を表示
 */
const randomText = () => {
    text = texts[Math.floor(Math.random() * texts.length)];
    outputText.innerHTML = spanText(text);
};

/**
 * タイプキーと単語の整合性チェック
 * @param string e タイプ文字
 */
const keyCheck = (e) => {
    num = text.length;
    if (e.key.length < 2 && e.key !== " " && !e.repeat) {
        if (text.charAt(input) === e.key && match === input) {
            inputText += e.key;
            outputText.children[input].classList.add("true_style");
            input++;
            match++;
            correct++;
        } else if (match === input) {
            inputText += e.key;
            outputText.children[input].classList = "false_style";
            input++;
            miss++;
        } else if (match !== input) {
            inputText.slice(0, -1);
            inputText += e.key;
            if (text.charAt(input - 1) === e.key) {
                outputText.children[input - 1].classList.remove("false_style");
                outputText.children[input - 1].classList.add("true_style");
                match++;
                correct++;
            } else {
                outputText.children[input - 1].style.display = "none";
                outputText.children[input - 1].getClientRects();
                outputText.children[input - 1].style.display = "inline-block";
                miss++;
            }
        }
    }

    if (num === match) {
        count++;
        limit.finish();
    }
    stat.textContent = `得点 : ${count} タイプミス : ${miss} 残り時間 : ${timeNum} 秒`;
};

/**
 * 残り時間を計算
 */
const time = () => {
    timeNum--;
    stat.textContent = `得点 : ${count} タイプミス : ${miss} 残り時間 : ${timeNum} 秒`;
    if (timeNum == 0) {
        clearInterval(timer);
        result();
    }
};

/**
 * ステータスのリセット
 */
const reset = () => {
    inputText.textContent = "";
    num = input = match = 0;
};

/**
 * 単語毎の残り時間をバーで表示
 */
const bar = () => {
    const keyframes = {
        width: [1, 0],
    };
    const options = {
        duration: 5000 + text.length * 400,
        easing: "linear",
    };
    const effect = new KeyframeEffect(prgBar, keyframes, options);
    limit = new Animation(effect, document.timeline);
    limit.play();
    limit.onfinish = () => {
        reset();
        randomText();
        bar();
    };
};

/**
 * 終了時に総合結果を表示
 */
const result = () => {
    // cancelAnimationFrame(update);
    limit.onfinish = null;
    limit.finish();
    let avg = Math.ceil((correct / sec) * 100) / 100;
    stat.textContent = `結果　合計得点 : ${count}　有効タイプ :${correct}　タイプミス :${miss}　平均タイプ : ${avg} ／秒`;
    num = input = match = miss = count = correct = avg = 0;
    text = "";
    start.blur();
    start.disabled = false;
    restart.disabled = true;
    seconds.disabled = false;
};

/**
 * 残り時間を設定
 */
const setSec = () => {
    sec = timeNum = parseInt(document.getElementById("sec").value);
    stat.textContent = `得点 : ${count} タイプミス : ${miss} 残り時間 : ${timeNum} 秒`;
};

// スタートイベント
start.addEventListener("click", () => {
    timeNum = sec;
    inputText.textContent = "";
    start.blur();
    start.disabled = true;
    restart.disabled = false;
    seconds.disabled = true;
    randomText();
    timer = setInterval(time, 1000);
    bar();
});

// リセットイベント
restart.addEventListener("click", () => {
    limit.onfinish = null;
    limit.finish();
    clearInterval(timer);
    timeNum = sec;
    num = input = match = miss = count = correct = text = 0;
    start.blur();
    inputText.textContent = "";
    stat.textContent = `得点 : ${count} タイプミス : ${miss} 残り時間 : ${timeNum} 秒`;
    start.disabled = false;
    restart.disabled = true;
    seconds.disabled = false;
});

// キーダウンイベント
window.addEventListener("keydown", (e) => {
    if (text) {
        keyCheck(e);
    }
});
