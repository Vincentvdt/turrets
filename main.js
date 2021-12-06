document.addEventListener("DOMContentLoaded", () => {

    const root = document.querySelector('#root');
    const message = root.querySelector('p span');


    function calcAngle(origin, p2) {
        let dx = p2.x - origin.x;
        let dy = p2.y - origin.y;

        return Math.atan2(dy, dx) * 180 / Math.PI
    }

    class Turret {

        constructor(posX, posY) {
            this.turretDOM = "";
            this.id = Math.floor(Math.random() * Date.now()).toString();
            this.posX = posX;
            this.posY = posY;
            this.size = Math.floor(Math.random() * (50 - 20) + 20);
            this.diameter = this.size * (Math.floor(Math.random() * (10 - 5) + 5));
        }


        init() {
            let newTurret = this.createDomElement();
            root.appendChild(newTurret);
            this.turretDOM = document.querySelector(`.turret[data-id="${this.id}"]`);
            this.addEvent(this.turretDOM);
        }

        destroy(turret) {
            root.removeChild(turret.parentNode);
            console.log(`You killed : ${turret.parentNode.dataset.id}`);
        }

        addEvent(turret) {
            let turretZone = turret.querySelector('.zone');

            turretZone.addEventListener('mouseover', () => {
                this.turretDOM.classList.add("triggered");
            })

            turretZone.addEventListener('mouseout', () => {
                this.turretDOM.classList.remove("triggered");
            })

            turret.addEventListener('click', (e) => {
                e.stopPropagation();
                this.destroy(e.target);
            })
        }

        createDomElement() {
            let turretDOM = document.createElement("div");
            turretDOM.dataset.id = this.id;

            turretDOM.setAttribute("class", "turret");
            turretDOM.setAttribute("style", `
                width: ${this.size}px;
                height: ${this.size}px; 
                top:${this.posY}px; 
                left:${this.posX}px;`);

            let aggroArea = document.createElement("div");
            aggroArea.setAttribute("class", "zone");
            turretDOM.appendChild(aggroArea)


            turretDOM.querySelector('.zone').setAttribute('style',
                `width: ${this.diameter}px; height: ${this.diameter}px;`)

            turretDOM.innerHTML += `<p>${this.id}</p>`

            return turretDOM;
        }

    }

    root.addEventListener("click", (e) => {
        let newTurret = new Turret(e.pageX, e.pageY);
        newTurret.init()
    })


    document.addEventListener("mousemove", (e) => {
        let hoveredTurret = allElementsFromPoint(e.pageX, e.pageY);
        let msg = [];
        if (hoveredTurret) {
            let parentNode = hoveredTurret.map(turret => turret.parentNode);
            parentNode.forEach(turret => {
                msg.push(turret.dataset.id)
                let deg = Math.floor((
                    calcAngle({
                        x: turret.offsetLeft,
                        y: turret.offsetTop
                    }, {
                        x: e.pageX,
                        y: e.pageY
                    }) + 360) % 360);

                turret.style.transform = `rotate(${deg}deg)`
            })
        }
        message.innerText = msg;
    })


    function allElementsFromPoint(x, y) {
        let element, elements = [];
        let old_visibility = [];
        while (true) {
            element = document.elementFromPoint(x, y);
            if (!element || element === document.documentElement || !element.classList.contains("zone")) {
                break;
            }
            elements.push(element);
            old_visibility.push(element.style.visibility);
            element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
        }
        for (let k = 0; k < elements.length; k++) {
            elements[k].style.visibility = old_visibility[k];
        }
        elements.reverse();
        if (elements.length) {
            return elements
        }
    }

});