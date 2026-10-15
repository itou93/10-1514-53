const deptNames = {
    'stamp-a': '電子機械科',
    'stamp-b': '情報技術科',
    'stamp-c': '情報処理科',
    'stamp-d': '服飾デザイン科',
    'stamp-e': '食物調理科',
    'stamp-f': '流通経済科'
};

let clickCount = 0;
let clickTimer = null;
let nearLogTimeout = null;

// DOM読み込み完了時にマーカーの検出イベントを設定
window.addEventListener('DOMContentLoaded', () => {
    const markers = document.querySelectorAll('a-marker');

    markers.forEach(marker => {
        marker.addEventListener('markerFound', function () {
            console.log("検出成功:", this.id);

            // スタンプフラグの保存
            try {
                if (this.id === 'ar-marker-1') localStorage.setItem('stamp-a-flag', '1');
                else if (this.id === 'ar-marker-2') localStorage.setItem('stamp-b-flag', '1');
                else if (this.id === 'ar-marker-3') localStorage.setItem('stamp-c-flag', '1');
            } catch (e) {}

            // マーカー内の <a-video> に紐づく <video> タグを取得して再生
            const aVideo = this.querySelector('a-video');
            if (aVideo) {
                const videoSrc = aVideo.getAttribute('src');
                const videoElem = document.querySelector(videoSrc);

                if (videoElem) {
                    videoElem.currentTime = 0;
                    // 自動再生ブロック対策：まずは消音で再生を開始
                    videoElem.muted = true;
                    videoElem.play().then(() => {
                        console.log("動画再生スタート成功！");
                    }).catch(e => {
                        console.log("再生ブロック:", e);
                    });
                }
            }

            setTimeout(() => {
                showNearObjectLog();
            }, 1500);
        });

        marker.addEventListener('markerLost', function () {
            console.log("マーカー喪失:", this.id);

            const aVideo = this.querySelector('a-video');
            if (aVideo) {
                const videoSrc = aVideo.getAttribute('src');
                const videoElem = document.querySelector(videoSrc);

                if (videoElem) {
                    videoElem.pause();
                }
            }
        });
    });

    // 画面タップで消音解除
    const enableAudio = () => {
        const videos = document.querySelectorAll('a-assets video');
        videos.forEach(v => v.muted = false);
    };
    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('touchstart', enableAudio, { once: true });
});

function startAR() {
    const screen = document.getElementById('explanation-screen');
    if (screen) {
        screen.remove();
    }
}

function openCollection() {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCollection() {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.style.display = 'none';
}

function selectDepartment(deptKey) {
    openDeptVideos(deptKey);
}

function openDeptVideos(deptKey) {
    const modal = document.getElementById('dept-video-modal');
    const title = document.getElementById('dept-title');
    const list = document.getElementById('dept-video-list');
    
    if (title) title.textContent = `${deptNames[deptKey] || '学科'} の動画一覧`;
    
    if (list) {
        list.innerHTML = '';

        const spots = [
            { id: 'stamp-a-flag', title: 'スポット1：校章スポット', src: 'jgvideo2.mp4' },
            { id: 'stamp-b-flag', title: 'スポット2：シューティングゲーム', src: 'GameVideo.mp4' },
            { id: 'stamp-c-flag', title: 'スポット3：丸型スポット', src: 'jgvideo2.mp4' }
        ];

        spots.forEach(spot => {
            let isUnlocked = false;

            try {
                isUnlocked = (localStorage.setItem && localStorage.getItem(spot.id) === '1');
            } catch (e) {
                isUnlocked = false;
            }

            const div = document.createElement('div');
            div.className = `video-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            if (isUnlocked) {
                div.innerHTML = `
                    <p style="font-weight:bold; margin:0 0 8px 0; color:#059669;">🔓 ${spot.title}</p>
                    <video src="${spot.src}" controls style="width:100%; border-radius:8px; display:block;"></video>
                `;
            } else {
                div.innerHTML = `
                    <p style="font-weight:bold; margin:0; color:#475569;">🔒 ${spot.title}</p>
                    <div class="secret-box" style="background:#cbd5e1; border-radius:10px; padding:20px; text-align:center; margin-top:8px;">
                        <div class="secret-icon" style="font-size:36px; font-weight:bold; color:#64748b; margin-bottom:4px;">❓</div>
                        <small style="color:#64748b; font-weight:bold;">ARマーカーを探して解放しよう！</small>
                    </div>
                `;
            }
            list.appendChild(div);
        });
    }
    
    const collectionModal = document.getElementById('collection-modal');
    if (collectionModal) collectionModal.style.display = 'none';
    if (modal) modal.style.display = 'flex';
}

function closeDeptVideos() {
    const deptModal = document.getElementById('dept-video-modal');
    const collectionModal = document.getElementById('collection-modal');
    
    if (deptModal) {
        const videos = deptModal.querySelectorAll('video');
        videos.forEach(v => v.pause());
        deptModal.style.display = 'none';
    }
    
    if (collectionModal) {
        collectionModal.style.display = 'flex';
    }
}

function handleTitleClick() {
    clickCount++;
    clearTimeout(clickTimer);

    if (clickCount >= 5) {
        clickCount = 0;
        if (confirm('【開発者コマンド】スタンプと解放状況を全リセットしますか？')) {
            try { localStorage.clear(); } catch(e){}
            alert('すべての進行状況をリセットしました！');
            location.reload();
        }
    } else {
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 1500);
    }
}

function showNearObjectLog() {
    const logElem = document.getElementById('near-object-log');
    if (!logElem) return;

    logElem.classList.add('show');

    clearTimeout(nearLogTimeout);
    nearLogTimeout = setTimeout(() => {
        logElem.classList.remove('show');
    }, 10000);
}

function switchToMarkerless() {
    window.location.href = 'test.html';
}