class RobotScene extends Phaser.Scene {
    constructor() {
        super(phaserSceneName);
        this.isMouseDown = false;
        this.animationBlocks = [];

        /* Used in path visualization */
        this.isPositioning = false;
        this.showCircles = false;
        this.showArrows = false;
        this.circleRadius = 64;
        this.positionLabels = [];
        this.positionCircles = [];
    }

    preload() {
        this.load.spritesheet('gripper', 'https://raw.githubusercontent.com/fronchetti/path-planning-web/main/assets/gripper.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('boxes', 'https://raw.githubusercontent.com/fronchetti/path-planning-web/main/assets/boxes.png', { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet('circles', 'https://raw.githubusercontent.com/fronchetti/path-planning-web/main/assets/circles.png', { frameWidth: 256, frameHeight: 256 });
        this.load.tilemapTiledJSON('map', 'https://raw.githubusercontent.com/fronchetti/path-planning-web/main/assets/sandbox.tmj');
        this.load.image('tileset', 'https://raw.githubusercontent.com/fronchetti/path-planning-web/main/assets/boxes.png');
    }

    create() {
        /* Create the level */
        var map = this.make.tilemap({ key: 'map' });
        var tileset = map.addTilesetImage('boxes', 'tileset');
        var groundLayer = map.createLayer('ground', tileset);
        var markersLayer = map.createLayer('markers', tileset);

        /* Boxes settings */
        this.boxA = this.add.sprite(1600, 1600, 'boxes', 5);
        this.boxB = this.physics.add.sprite(800, 900, 'boxes', 6);
        this.boxC = this.physics.add.sprite(1300, 1850, 'boxes', 7);
        this.boxD = this.physics.add.sprite(700, 200, 'boxes', 8);

        /* Gripper settings */
        this.gripper = this.physics.add.sprite(1024, 1024, 'gripper');
        this.gripper.setScale(1.5);
        this.gripper.setInteractive();
        this.gripper.body.setSize(164, 164);
        this.gripper.setCollideWorldBounds(true);

        /* Container settings (used to group gripper and nearest box) */
        this.container = this.add.container(this.gripper.x, this.gripper.y);
        this.container.setSize(this.gripper.width, this.gripper.height);

        /* Mouse mapping */
        this.input.mouse.disableContextMenu();

        this.input.on('pointerdown', function () {
            this.isMouseDown = true;
        }, this);

        this.input.on('pointerup', function () {
            this.isMouseDown = false;
        }, this);

        /* Arrows drawing */
        this.directionGraphics = this.add.graphics();
    }

    update() {
        this.container.setPosition(this.gripper.x, this.gripper.y)

        if (this.isMouseDown && !this.isPositioning) {
            this.gripper.x = this.input.activePointer.worldX;
            this.gripper.y = this.input.activePointer.worldY;
        }
    }

    getGripperPosition() {
        return [this.gripper.x, this.gripper.y]
    }

    setAnimationBlocks(blocks) {
        this.savedAnimations = blocks; /* Used to perform animation */
    }

    executeAnimation() {
        const nextBlock = this.savedAnimations.shift();

        if (nextBlock) {
            blocklyWorkspace.highlightBlock(nextBlock.id);

            if (nextBlock.type === "move_to_position") {
                var positionName = nextBlock.getFieldValue("DROPDOWN_OPTIONS");
                var coordinates = savedCoordinates.get(positionName);

                this.tweens.add({
                    targets: this.gripper,
                    x: coordinates[0],
                    y: coordinates[1],
                    duration: 1000,
                    onComplete: () => {
                        this.executeAnimation(); // Move to each saved position recursively
                    }
                });
            }
            else if (nextBlock.type === "pick_object") {
                var closestBox = this.physics.closest(this.gripper, [this.boxA, this.boxB, this.boxC, this.boxD]);
                var distanceFromGripper = Phaser.Math.Distance.Between(this.gripper.x, this.gripper.y, closestBox.x, closestBox.y);
                var pickupDistance = 25; /* Reachable radius */

                if (distanceFromGripper < pickupDistance) {
                    if (this.container.list.length == 0) {
                        closestBox.setPosition((this.gripper.height / 2) - (closestBox.height / 2), (this.gripper.width / 2) - (closestBox.width / 2));
                        this.container.add(closestBox);
                        this.children.bringToTop(this.gripper);
                    } else {
                        console.log("Gripper is holding another box.")
                    }
                }

                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.executeAnimation();
                    },
                    loop: false
                })
            }
            else if (nextBlock.type === "release_object") {
                this.container.each(function (box) {
                    box.setPosition(this.gripper.x, this.gripper.y);
                }, this);

                this.container.removeAll(); /* Clear container */
                this.children.bringToTop(this.gripper);

                this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.executeAnimation();
                    },
                    loop: false
                })
            }
            else {
                this.executeAnimation();
            }
        } else {
            this.drawCircles();
            this.drawLabels();
            this.drawArrows();
            console.log('Phaser: Executed all block animations.');
        }
    }

    drawCircles() {
        if (this.showCircles) {
            /* Get ordered positions of movement blocks
            attached to starting block */
            this.positionValues = getBlocklyPositions();

            /* Clear previous drawings */
            this.positionCircles.forEach(circle => circle.destroy());

            for (let i = 0; i < this.positionValues.length; i++) {
                const positionCoordinates = this.positionValues[i][1];

                const positionX = positionCoordinates[0];
                const positionY = positionCoordinates[1];

                //const positionCircle = this.add.circle(positionX, positionY, this.circleRadius, 0x000);
                const positionCircle = this.physics.add.sprite(positionX, positionY, 'circles', 0);
                positionCircle.setScale(0.5);

                positionCircle.setInteractive();
                this.input.setDraggable(positionCircle);
                this.positionCircles.push(positionCircle)

                positionCircle.on('drag', function (p, x, y) {
                    this.isPositioning = true;

                    /* Updating elements position and values */
                    positionCircle.x = x;
                    positionCircle.y = y;
                    this.positionLabels[i].x = x;
                    this.positionLabels[i].y = y - (this.circleRadius * 1.45);
                    this.gripper.x = positionCircle.x;
                    this.gripper.y = positionCircle.y;
                    this.positionValues[i][1][0] = x;
                    this.positionValues[i][1][1] = y;

                    this.children.bringToTop(positionCircle);
                    //positionCircle.setFillStyle(0xff3e1c);
                    this.drawArrows();
                    this.drawLabels();
                }, this);

                positionCircle.on('dragend', function () {
                    this.isPositioning = false;
                    this.drawCircles();
                    this.drawArrows();
                    this.drawLabels();
                }, this);
            }
        }
    }

    hideCircles() {
        if (!this.showCircles) {
            this.positionCircles.forEach(circle => circle.destroy());
        }
    }

    drawLabels() {
        if (this.showCircles) {
            /* Get ordered positions of movement blocks
            attached to starting block */
            this.positionValues = getBlocklyPositions();

            /* Clear previous drawings */
            this.positionLabels.forEach(label => label.destroy());

            for (let i = 0; i < this.positionValues.length; i++) {
                var positionName = this.positionValues[i][0];
                const positionCoordinates = this.positionValues[i][1];

                const positionX = positionCoordinates[0];
                const positionY = positionCoordinates[1];

                const positionLabel = this.add.text(positionX, positionY - (this.circleRadius * 1.45), String(positionName),
                    { font: 'bold 48px Arial', color: '#fff' }).setOrigin(0.5);
                positionLabel.setStroke('#000', 10);
                this.children.bringToTop(positionLabel);
                this.positionLabels.push(positionLabel);
            }
        }
    }

    hideLabels() {
        if (!this.showCircles) {
            this.positionLabels.forEach(label => label.destroy());
        }
    }

    drawArrows() {
        if (this.showArrows) {
            /* Get ordered positions of movement blocks
            attached to starting block */
            this.positionValues = getBlocklyPositions();

            /* Clear previous drawings */
            this.directionGraphics.clear();

            for (let i = 0; i < this.positionValues.length - 1; i++) {
                const currentPosition = this.positionValues[i][1];
                const nextPosition = this.positionValues[i + 1][1];

                var angle = Phaser.Math.Angle.Between(currentPosition[0], currentPosition[1], nextPosition[0], nextPosition[1]);

                var startPointX = currentPosition[0] + (this.circleRadius + 10) * Math.cos(angle);
                var startPointY = currentPosition[1] + (this.circleRadius + 10) * Math.sin(angle);
                var endPointX = nextPosition[0] - (this.circleRadius + 10) * Math.cos(angle);
                var endPointY = nextPosition[1] - (this.circleRadius + 10) * Math.sin(angle);

                var lineThickness = 5;

                /* Line */
                this.directionGraphics.lineStyle(lineThickness, 0x121212, 0.25);
                this.directionGraphics.beginPath()
                this.directionGraphics.moveTo(startPointX, startPointY);
                this.directionGraphics.lineTo(endPointX, endPointY);
                this.directionGraphics.strokePath();

                /* Arrow */
                var arrowSize = 50;
                var endPointX = nextPosition[0] - (this.circleRadius + 5) * Math.cos(angle);
                var endPointY = nextPosition[1] - (this.circleRadius + 5) * Math.sin(angle);
                var pointA = new Phaser.Geom.Point(endPointX, endPointY);
                var pointB = new Phaser.Geom.Point(endPointX + arrowSize * Math.cos(angle + Phaser.Math.DegToRad(150)), endPointY + arrowSize * Math.sin(angle + Phaser.Math.DegToRad(150)));
                var pointC = new Phaser.Geom.Point(endPointX + arrowSize * Math.cos(angle + Phaser.Math.DegToRad(210)), endPointY + arrowSize * Math.sin(angle + Phaser.Math.DegToRad(210)));
                this.directionGraphics.fillStyle(0x121212, 1);
                this.directionGraphics.fillTriangle(pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y);
                this.directionGraphics.closePath();
            }
            this.children.bringToTop(this.directionGraphics);
        }
    }

    hideArrows() {
        if (!this.showArrows) {
            this.directionGraphics.clear();
        }
    }
}

var config = {
    width: 2048,
    height: 2048,
    parent: 'game-canvas',
    scene: [RobotScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
    },
    loader: {
        crossOrigin: 'anonymous'
    },
};

var game = new Phaser.Game(config);