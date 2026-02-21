export function draw(walkr1, walkr2, walkr3, walkl1, walkl2, walkl3) {
    const canvas = document.getElementById("sprite");
    const ctx = canvas.getContext("2d");
    const images = [walkr1, walkr2, walkr3, walkl1, walkl2, walkl3];
    function loadImages() {
        let loaded = 0;
        images.forEach((src, index) => {
            const img = new Image();
            console.log(src, index);
            img.onload = () => {
                loaded++;
                console.log(loaded);
                images[index] = img;
                if (loaded == images.length) {
                    start();
                }
            }
            img.onerror = () => {
                console.error(`Failed to load image at: ${src}`);
            };
            img.src = src;
        })
    }

    const key = {};

    document.addEventListener('keydown', (event) => {
        key[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
        key[event.key] = false;
    });

    function start() {
        console.log("animate")
        requestAnimationFrame(animate);
    }

    let direction;
    let cur = 1;
    let framecount = 0;

    function animate() {
        const right = (key['ArrowRight'] === true || key['d'] === true);
        const left = (key['ArrowLeft'] === true || key['a'] === true);
        console.log(key["ArrowRight"])
        if (right && direction != 'left') {
            direction = 'right';
        }
        else if (left && direction != 'right') {
            direction = 'left';
        }
        else {
            direction = undefined;
        }
        if (direction != 'left' && direction != 'right') {
            cur = (cur > 2 ? 4 : 1);
            framecount = 0;
        }
        else {
            framecount++;
            if (framecount % 10 == 1) {
                cur = (cur + 1) % 3 + (direction === 'left') * 3;
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[cur], 0, 0, 75, 150);
        requestAnimationFrame(animate);
    }

    loadImages();
}