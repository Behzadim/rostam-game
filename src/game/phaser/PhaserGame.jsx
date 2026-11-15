import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../gameStore/gameStore';
import { KHANS_DATA } from '../data/khansData';
import { stopMusic } from '../../utils/soundManager';

export default function PhaserGame() {
    const gameContainerRef = useRef(null);
    const phaserGameRef = useRef(null);

    // خواندن اطلاعات واقعی بازیکن از استور
    const currentKhan = useGameStore((state) => state.currentKhan ?? 1);
    const stats = useGameStore((state) => state.stats);
    const inventory = useGameStore((state) => state.inventory);
    const useNooshdaroo = useGameStore((state) => state.useNooshdaroo);
    const advanceToNextKhan = useGameStore((state) => state.advanceToNextKhan);
    const setGameStage = useGameStore((state) => state.setGameStage);

    const khanData = KHANS_DATA[currentKhan] || KHANS_DATA[1];

    // استیت‌های رابط کاربری حین نبرد (HUD)
    const [rostamHp, setRostamHp] = useState(stats?.maxHealth || 150);
    const [bossHp, setBossHp] = useState(khanData.bossMaxHp);
    const [bossEngaged, setBossEngaged] = useState(false);
    const [battleStatus, setBattleStatus] = useState('FIGHTING'); // 'FIGHTING' | 'VICTORY' | 'DEFEAT'

    // ارتباط مستقیم و بدون لگ بین دکمه‌های لمسی React و حلقه 60 فریم Phaser
    const controlsRef = useRef({ left: false, right: false, jump: false });
    const sceneActionsRef = useRef({ attack: null, heal: null });

    useEffect(() => {
        // قطع موزیک منوی اصلی هنگام ورود به میدان رزم
        stopMusic();

        if (phaserGameRef.current) return;

        const maxHp = stats?.maxHealth || 150;
        const maceDamage = stats?.attackPower || 35;

        class KhanBattleScene extends Phaser.Scene {
            constructor() {
                super({ key: 'KhanBattleScene' });
            }

            create() {
                const worldWidth = 2600;
                const worldHeight = 720;

                this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
                this.cameras.main.setBackgroundColor(khanData.skyColor);
                this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

                this.isGameOver = false;
                this.rostamMaxHp = maxHp;
                this.rostamCurrentHp = maxHp;
                this.maceDamage = maceDamage;
                this.lastAttackTime = 0;

                // ۱. ترسیم محیط و پس‌زمینه اختصاصی هر خوان
                this.createEnvironment(worldWidth, worldHeight);

                // ۲. ساخت کاراکتر رستم با الهام از تصویر اصلی و گرز گاوسر
                this.createRostam();

                // ۳. ساخت پیش‌قراولان در مسیر خطی و باس‌فایت در انتهای خوان
                this.enemies = this.physics.add.group();
                this.createMinion(850, 520, 'نگهبان اهریمن');
                this.createMinion(1450, 520, 'دیو پیش‌قراول');
                this.createBoss(2200, 490);

                // برخورد فیزیکی با زمین
                this.physics.add.collider(this.rostam, this.ground);
                this.physics.add.collider(this.enemies, this.ground);

                // دنبال کردن رستم توسط دوربین در طول مسیر خوان
                this.cameras.main.startFollow(this.rostam, true, 0.09, 0.09);

                // تنظیم کلیدهای کیبورد برای تست روی کامپیوتر
                this.cursors = this.input.keyboard.createCursorKeys();
                this.keys = this.input.keyboard.addKeys({
                    a: Phaser.Input.Keyboard.KeyCodes.A,
                    d: Phaser.Input.Keyboard.KeyCodes.D,
                    w: Phaser.Input.Keyboard.KeyCodes.W,
                    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
                    j: Phaser.Input.Keyboard.KeyCodes.J,
                });

                // اتصال توابع ضربه گرز و نوشدارو به دکمه‌های React
                sceneActionsRef.current.attack = () => this.swingMace();
                sceneActionsRef.current.heal = () => {
                    if (this.isGameOver || this.rostamCurrentHp >= this.rostamMaxHp) return false;
                    this.rostamCurrentHp = Math.min(this.rostamMaxHp, this.rostamCurrentHp + Math.floor(this.rostamMaxHp * 0.6));
                    setRostamHp(this.rostamCurrentHp);
                    this.showFloatingText(this.rostam.x, this.rostam.y - 90, '+ نوشدارو', '#2ecc71');
                    return true;
                };
            }

            createEnvironment(worldWidth, worldHeight) {
                const bgGraphics = this.add.graphics();

                // کوه‌های دوردست با حرکت پارالاکس
                bgGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(khanData.accentColor).color, 0.35);
                for (let x = 0; x < worldWidth; x += 350) {
                    bgGraphics.fillTriangle(x, 600, x + 200, 260, x + 400, 600);
                }
                bgGraphics.setScrollFactor(0.4);

                // عناصر محیطی مسیر (صخره‌ها و ستون‌های باستانی)
                const midGraphics = this.add.graphics();
                midGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(khanData.groundColor).color, 0.7);
                for (let x = 250; x < worldWidth; x += 420) {
                    midGraphics.fillRoundedRect(x, 470, 50, 130, 8);
                }

                // علامت هشدار ورود به قلمرو باس در انتهای مسیر
                const bossGate = this.add.graphics();
                bossGate.lineStyle(4, 0xd4af37, 0.8);
                bossGate.strokeRect(1820, 420, 16, 180);
                this.add.text(1828, 390, `قلمرو ${khanData.bossName}`, {
                    fontFamily: 'Tahoma',
                    fontSize: '18px',
                    color: '#ffd700',
                    fontStyle: 'bold',
                }).setOrigin(0.5);

                // ساخت زمین فیزیکی
                const groundColor = Phaser.Display.Color.HexStringToColor(khanData.groundColor).color;
                const groundRect = this.add.rectangle(worldWidth / 2, 660, worldWidth, 120, groundColor);
                const groundBorder = this.add.rectangle(worldWidth / 2, 602, worldWidth, 6, 0xd4af37);

                this.ground = this.physics.add.existing(groundRect, true);
            }

            createRostam() {
                this.rostam = this.add.container(180, 500);
                this.rostam.setSize(56, 110);
                this.physics.world.enable(this.rostam);
                this.rostam.body.setCollideWorldBounds(true);
                this.rostam.body.setGravityY(600);

                // ۱. شنل سرخ‌رنگ رستم
                this.cape = this.add.polygon(-18, 8, [0, -35, -32, 45, -8, 48, 8, -25], 0x9e1b1b);

                // ۲. پاها و چکمه‌های جنگی
                const legs = this.add.rectangle(0, 38, 32, 36, 0x3b2818);
                const boots = this.add.rectangle(0, 48, 36, 16, 0x8c6239);

                // ۳. زره ببر بیان (برنزی با حاشیه طلایی)
                const torso = this.add.rectangle(0, 0, 44, 54, 0x7a5230);
                torso.setStrokeStyle(3, 0xd4af37);
                const belt = this.add.rectangle(0, 18, 46, 10, 0xd4af37);

                // ۴. سر، ریش و گیسوان مشکی بلند
                const hairBack = this.add.rectangle(-10, -36, 28, 30, 0x141414);
                const head = this.add.circle(2, -38, 15, 0xd9a17c);
                const beard = this.add.polygon(6, -28, [-8, 0, 10, 0, 4, 16, -6, 12], 0x141414);

                // ۵. بازو و گرز گاوسر (سلاح اصلی رستم)
                this.macePivot = this.add.container(14, -8);
                const handle = this.add.rectangle(18, -12, 8, 56, 0x5c3a21).setRotation(0.4);
                const maceHead = this.add.circle(30, -34, 14, 0xc0c0c0);
                maceHead.setStrokeStyle(3, 0xffd700);
                // شاخ‌های گرز گاوسر
                const hornLeft = this.add.triangle(22, -46, 0, 10, 5, 0, 10, 10, 0xffd700);
                const hornRight = this.add.triangle(38, -46, 0, 10, 5, 0, 10, 10, 0xffd700);
                this.macePivot.add([handle, maceHead, hornLeft, hornRight]);

                this.rostam.add([this.cape, legs, boots, torso, belt, hairBack, head, beard, this.macePivot]);
                this.rostamFacing = 1; // 1: راست، -1: چپ
            }

            createMinion(x, y, name) {
                const minion = this.add.container(x, y);
                minion.setSize(48, 90);
                this.physics.world.enable(minion);
                minion.body.setCollideWorldBounds(true);
                minion.body.setGravityY(600);

                const body = this.add.rectangle(0, 0, 44, 80, 0x4a151b);
                body.setStrokeStyle(2, 0xff5555);
                const eye = this.add.circle(-8, -22, 6, 0xffd700);
                const hpBg = this.add.rectangle(0, -58, 54, 8, 0x000000);
                const hpBar = this.add.rectangle(0, -58, 50, 5, 0xe74c3c);

                minion.add([body, eye, hpBg, hpBar]);
                minion.isBoss = false;
                minion.enemyName = name;
                minion.maxHp = 70 + currentKhan * 25;
                minion.hp = minion.maxHp;
                minion.damage = 8 + currentKhan * 3;
                minion.hpBar = hpBar;
                minion.patrolOrigin = x;
                minion.lastHitTime = 0;

                this.enemies.add(minion);
            }

            createBoss(x, y) {
                const scale = khanData.bossScale || 1.2;
                const boss = this.add.container(x, y);
                boss.setSize(76 * scale, 120 * scale);
                this.physics.world.enable(boss);
                boss.body.setCollideWorldBounds(true);
                boss.body.setGravityY(600);

                // ظاهر باس متناسب با هر خوان
                const aura = this.add.circle(0, 0, 65 * scale, khanData.bossColor, 0.2);
                const torso = this.add.rectangle(0, 0, 70 * scale, 110 * scale, khanData.bossColor);
                torso.setStrokeStyle(4, 0xffd700);
                const horn1 = this.add.triangle(-20 * scale, -68 * scale, 0, 24, 12, 0, 24, 24, 0xff3b3b);
                const horn2 = this.add.triangle(20 * scale, -68 * scale, 0, 24, 12, 0, 24, 24, 0xff3b3b);
                const eyes = this.add.rectangle(-12 * scale, -32 * scale, 22 * scale, 8 * scale, 0xff0000);

                const label = this.add.text(0, -88 * scale, khanData.bossName, {
                    fontFamily: 'Tahoma',
                    fontSize: '18px',
                    color: '#ffdf73',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 4,
                }).setOrigin(0.5);

                boss.add([aura, torso, horn1, horn2, eyes, label]);
                boss.isBoss = true;
                boss.maxHp = khanData.bossMaxHp;
                boss.hp = khanData.bossMaxHp;
                boss.damage = khanData.bossDamage;
                boss.lastHitTime = 0;

                this.boss = boss;
                this.enemies.add(boss);
            }

            swingMace() {
                if (this.isGameOver) return;
                const now = this.time.now;
                if (now - this.lastAttackTime < 380) return; // فاصله زمانی بین ضربات گرز
                this.lastAttackTime = now;

                // انیمیشن فرود آوردن گرز گاوسر
                this.tweens.add({
                    targets: this.macePivot,
                    angle: 115,
                    duration: 130,
                    yoyo: true,
                    ease: 'Power2',
                });

                // افکت موج ضربه طلایی گرز
                const hitX = this.rostam.x + this.rostamFacing * 68;
                const wave = this.add.circle(hitX, this.rostam.y, 38, 0xffd700, 0.45);
                this.tweens.add({
                    targets: wave,
                    scale: 1.5,
                    alpha: 0,
                    duration: 220,
                    onComplete: () => wave.destroy(),
                });

                // بررسی برخورد گرز با دشمنان و باس
                this.enemies.getChildren().forEach((enemy) => {
                    if (!enemy.active) return;
                    const dist = Phaser.Math.Distance.Between(hitX, this.rostam.y, enemy.x, enemy.y);
                    const hitRange = enemy.isBoss ? 125 : 95;

                    if (dist <= hitRange) {
                        enemy.hp = Math.max(0, enemy.hp - this.maceDamage);
                        this.showFloatingText(enemy.x, enemy.y - 70, `-${this.maceDamage}`, '#ffdf40');

                        // عقب راندن دشمن در اثر ضربه سنگین گرز
                        enemy.body.setVelocityX(this.rostamFacing * (enemy.isBoss ? 140 : 280));
                        enemy.body.setVelocityY(-180);

                        if (enemy.isBoss) {
                            setBossHp(enemy.hp);
                            this.cameras.main.shake(120, 0.008);
                            if (enemy.hp <= 0) {
                                this.handleVictory(enemy);
                            }
                        } else {
                            enemy.hpBar.width = (enemy.hp / enemy.maxHp) * 50;
                            if (enemy.hp <= 0) {
                                this.showFloatingText(enemy.x, enemy.y - 40, 'هلاک شد!', '#ffffff');
                                enemy.destroy();
                            }
                        }
                    }
                });
            }

            showFloatingText(x, y, message, color) {
                const txt = this.add.text(x, y, message, {
                    fontFamily: 'Tahoma',
                    fontSize: '20px',
                    fontStyle: 'bold',
                    color: color,
                    stroke: '#000',
                    strokeThickness: 4,
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: txt,
                    y: y - 45,
                    alpha: 0,
                    duration: 750,
                    onComplete: () => txt.destroy(),
                });
            }

            handleVictory(boss) {
                this.isGameOver = true;
                this.cameras.main.shake(350, 0.015);
                boss.destroy();
                this.rostam.body.setVelocityX(0);
                setTimeout(() => {
                    setBattleStatus('VICTORY');
                }, 600);
            }

            handleDefeat() {
                this.isGameOver = true;
                this.rostam.setAlpha(0.4);
                this.rostam.body.setVelocityX(0);
                setTimeout(() => {
                    setBattleStatus('DEFEAT');
                }, 500);
            }

            update(time) {
                if (this.isGameOver) return;

                const moveLeft = this.cursors.left.isDown || this.keys.a.isDown || controlsRef.current.left;
                const moveRight = this.cursors.right.isDown || this.keys.d.isDown || controlsRef.current.right;
                const jumpPressed = this.cursors.up.isDown || this.keys.w.isDown || controlsRef.current.jump;
                const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.j);

                // ۱. حرکت رستم به چپ و راست
                if (moveLeft) {
                    this.rostam.body.setVelocityX(-290);
                    this.rostam.scaleX = -1;
                    this.rostamFacing = -1;
                } else if (moveRight) {
                    this.rostam.body.setVelocityX(290);
                    this.rostam.scaleX = 1;
                    this.rostamFacing = 1;
                } else {
                    this.rostam.body.setVelocityX(0);
                }

                // ۲. پرش رستم
                if (jumpPressed && this.rostam.body.blocked.down) {
                    this.rostam.body.setVelocityY(-540);
                }

                // ۳. ضربه گرز با کیبورد
                if (attackPressed) {
                    this.swingMace();
                }

                // ۴. فعال شدن نوار جان باس وقتی رستم به انتهای مسیر خوان می‌رسد
                if (this.rostam.x > 1650 && !bossEngaged) {
                    setBossEngaged(true);
                }

                // ۵. هوش مصنوعی دشمنان و باس‌فایت
                this.enemies.getChildren().forEach((enemy) => {
                    if (!enemy.active) return;

                    const distToRostam = Phaser.Math.Distance.Between(this.rostam.x, this.rostam.y, enemy.x, enemy.y);
                    const detectRange = enemy.isBoss ? 650 : 380;

                    if (distToRostam < detectRange) {
                        const dir = this.rostam.x < enemy.x ? -1 : 1;
                        const speed = enemy.isBoss ? 145 : 115;
                        enemy.body.setVelocityX(dir * speed);

                        // حمله دشمن یا باس به رستم در فاصله نزدیک
                        if (distToRostam < (enemy.isBoss ? 92 : 65) && time - enemy.lastHitTime > 1100) {
                            enemy.lastHitTime = time;
                            this.rostamCurrentHp = Math.max(0, this.rostamCurrentHp - enemy.damage);
                            setRostamHp(this.rostamCurrentHp);
                            this.showFloatingText(this.rostam.x, this.rostam.y - 80, `-${enemy.damage}`, '#ff4d4d');
                            this.cameras.main.shake(100, 0.006);

                            if (this.rostamCurrentHp <= 0) {
                                this.handleDefeat();
                            }
                        }
                    } else {
                        enemy.body.setVelocityX(0);
                    }
                });
            }
        }

        const config = {
            type: Phaser.AUTO,
            parent: gameContainerRef.current,
            width: 1280,
            height: 720,
            scale: {
                mode: Phaser.Scale.ENVELOP,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 900 },
                    debug: false,
                },
            },
            scene: [KhanBattleScene],
        };

        phaserGameRef.current = new Phaser.Game(config);

        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
            }
        };
    }, [currentKhan]);

    // هندلر استفاده از معجون نوشدارو در حین نبرد
    const handleUsePotion = () => {
        if ((inventory?.nooshdaroo || 0) <= 0) return;
        if (sceneActionsRef.current.heal && sceneActionsRef.current.heal()) {
            useNooshdaroo();
        }
    };

    const maxHp = stats?.maxHealth || 150;
    const rostamHpPercent = Math.max(0, Math.min(100, (rostamHp / maxHp) * 100));
    const bossHpPercent = Math.max(0, Math.min(100, (bossHp / khanData.bossMaxHp) * 100));

    return (
        <div className="battle-screen-wrapper">
            {/* بوم اصلی موتور Phaser */}
            <div ref={gameContainerRef} className="phaser-canvas-box" />

            {/* ==================== نوار وضعیت بالای میدان نبرد (Battle HUD) ==================== */}
            <div className="battle-top-hud">

                {/* وضعیت جان رستم و دکمه نوشدارو */}
                <div className="hud-fighter-box">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-warning">رستم دستان (گرز سطح {stats?.maceLevel || 1})</span>
                        <span className="small text-light">{rostamHp} / {maxHp}</span>
                    </div>
                    <div className="hud-hp-track">
                        <div className="hud-hp-fill rostam-hp" style={{ width: `${rostamHpPercent}%` }} />
                    </div>
                    <button
                        className="potion-quick-btn mt-2"
                        onClick={handleUsePotion}
                        disabled={(inventory?.nooshdaroo || 0) <= 0 || rostamHp >= maxHp}
                    >
                        🧪 نوشدارو ({inventory?.nooshdaroo || 0})
                    </button>
                </div>

                {/* عنوان خوان فعلی و راهنمای مسیر */}
                <div className="hud-khan-banner text-center">
                    <div className="khan-banner-title">{khanData.title}</div>
                    <div className="khan-banner-sub">
                        {bossEngaged ? `⚔️ نبرد با ${khanData.bossName}` : '⬅️ به سمت راست پیشروی کنید تا به باس برسید'}
                    </div>
                </div>

                {/* نوار جان باس‌فایت و دکمه بازگشت به لابی */}
                <div className="hud-fighter-box">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-danger">{khanData.bossName}</span>
                        <button className="hud-retreat-btn" onClick={() => setGameStage('MENU')}>
                            عقب‌نشینی به لابی
                        </button>
                    </div>
                    <div className="hud-hp-track">
                        <div className="hud-hp-fill boss-hp" style={{ width: `${bossHpPercent}%` }} />
                    </div>
                </div>

            </div>

            {/* ==================== دکمه‌های لمسی کنترل بازی (Touch Controls) ==================== */}
            <div className="battle-touch-controls">

                {/* دکمه‌های حرکت چپ و راست (سمت چپ پایین) */}
                <div className="touch-dpad">
                    <button
                        className="touch-ctrl-btn"
                        onMouseDown={() => (controlsRef.current.left = true)}
                        onMouseUp={() => (controlsRef.current.left = false)}
                        onMouseLeave={() => (controlsRef.current.left = false)}
                        onTouchStart={(e) => { e.preventDefault(); controlsRef.current.left = true; }}
                        onTouchEnd={() => (controlsRef.current.left = false)}
                    >
                        ◀
                    </button>
                    <button
                        className="touch-ctrl-btn"
                        onMouseDown={() => (controlsRef.current.right = true)}
                        onMouseUp={() => (controlsRef.current.right = false)}
                        onMouseLeave={() => (controlsRef.current.right = false)}
                        onTouchStart={(e) => { e.preventDefault(); controlsRef.current.right = true; }}
                        onTouchEnd={() => (controlsRef.current.right = false)}
                    >
                        ▶
                    </button>
                </div>

                {/* دکمه‌های پرش و ضربه گرز گاوسر (سمت راست پایین) */}
                <div className="touch-actions">
                    <button
                        className="touch-ctrl-btn jump-btn"
                        onMouseDown={() => (controlsRef.current.jump = true)}
                        onMouseUp={() => (controlsRef.current.jump = false)}
                        onTouchStart={(e) => { e.preventDefault(); controlsRef.current.jump = true; }}
                        onTouchEnd={() => (controlsRef.current.jump = false)}
                    >
                        پرش ⬆️
                    </button>
                    <button
                        className="touch-ctrl-btn mace-attack-btn"
                        onClick={() => sceneActionsRef.current.attack && sceneActionsRef.current.attack()}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            sceneActionsRef.current.attack && sceneActionsRef.current.attack();
                        }}
                    >
                        🔨 ضربه گرز
                    </button>
                </div>

            </div>

            {/* ==================== پنجره پیروزی بر باس و صعود خطی به خوان بعد ==================== */}
            {battleStatus === 'VICTORY' && (
                <div className="rpg-modal-overlay">
                    <div className="rpg-modal-box text-center">
                        <h3 className="text-warning fw-bold mb-2">ظفرمند باد رستم دستان!</h3>
                        <p className="text-light mb-3">
                            باس‌فایت <strong>«{khanData.bossName}»</strong> در {khanData.title} درهم شکسته شد!
                        </p>
                        <div className="p-3 mb-4 rounded border border-warning bg-dark bg-opacity-50">
                            <span className="text-warning fw-bold fs-5">
                                پاداش پیروزی: +{khanData.rewardCoins} سکه زر
                            </span>
                        </div>
                        <button
                            className="shahnameh-btn battle-start-btn justify-content-center w-100"
                            onClick={() => advanceToNextKhan(khanData.rewardCoins)}
                        >
                            <span className="battle-main-title">
                                {currentKhan < 7 ? `دریافت پاداش و صعود به خوان ${currentKhan + 1}` : 'پایان پیروزمندانه هفت‌خوان!'}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== پنجره شکست در نبرد ==================== */}
            {battleStatus === 'DEFEAT' && (
                <div className="rpg-modal-overlay">
                    <div className="rpg-modal-box text-center">
                        <h3 className="text-danger fw-bold mb-2">رستم در این رزم مجروح شد!</h3>
                        <p className="text-light mb-4">
                            می‌توانی به لابی برگردی، گرز گاوسر و زره ببر بیان را ارتقا دهی یا نوشدارو تهیه کنی و دوباره به میدان بازگردی.
                        </p>
                        <button
                            className="shahnameh-btn battle-start-btn justify-content-center w-100"
                            onClick={() => setGameStage('MENU')}
                        >
                            <span className="battle-main-title">بازگشت به لابی و تقویت تجهیزات</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}