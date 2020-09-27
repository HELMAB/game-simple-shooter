const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.height = innerHeight
canvas.width = innerWidth

const friction = 0.95
let score = 0


class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}


class ProjectTile extends Player {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

class Particle extends Player {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    super.draw();
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}


class Enemy extends ProjectTile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }
}

// init new player
const x = canvas.width / 2
const y = canvas.height / 2
const player = new Player(x, y, 10, 'white')

// project tiles
const projectTiles = []
const enemies = []
const particles = []
let animationId


function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()

  particles.forEach((particle) => {
    if (particle.alpha <= 0) {
      particles.splice(particles.indexOf(particle), 1)
    } else {
      particle.update()
    }
  })

  projectTiles.forEach((projectTile) => {
    projectTile.update()
    if (
      projectTile.x - projectTile.radius < 0 ||
      projectTile.x - projectTile.radius > canvas.width ||
      projectTile.y - projectTile.radius < 0 ||
      projectTile.y - projectTile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectTiles.splice(projectTiles.indexOf(projectTile), 1)
      }, 0)
    }
  })

  enemies.forEach((enemy) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // game over
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
    }

    // collision
    projectTiles.forEach((projectTile) => {
      const dist = Math.hypot(projectTile.x - enemy.x, projectTile.y - enemy.y)
      if (dist - enemy.radius - projectTile.radius < 1) {
        const audio = new Audio('./sounds/explosion.mp3')
        audio.play()
        score++
        document.getElementById('score').innerText = score

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(projectTile.x, projectTile.y, Math.random() * 2, enemy.color, {
            x: (Math.random() - 0.5) * (Math.random() * 8),
            y: (Math.random() - 0.5) * (Math.random() * 8)
          }))
        }

        setTimeout(() => {
          enemies.splice(enemies.indexOf(enemy), 1)
          projectTiles.splice(projectTiles.indexOf(projectTile), 1)
        }, 0)
      }
    })
  })
}

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10
    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x
    )

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  )

  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  }

  projectTiles.push(new ProjectTile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white',
    velocity
  ))
})

animate()
spawnEnemies()
document.getElementById('score').innerText = score
