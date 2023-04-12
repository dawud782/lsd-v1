const config = {
    tickspeed: 120,
    gameHeight: 540,
    gameWidth: 1200,
    edgeSquares: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 119, 120, 179, 180, 239, 240, 299, 300, 359, 360, 419, 420, 479, 480, 539, 540, 599, 600, 659, 660, 719, 720, 779, 780, 839, 840, 899, 900, 959, 960, 1019, 1020, 1079, 1080, 1139, 1140, 1199, 1200, 1259, 1260, 1319, 1320, 1379, 1380, 1439, 1440, 1499, 1500, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585, 1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597, 1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609, 1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619],
    powerups: ["frenzy", "wall", "invincible"],
    powerupChance: 0.015,
    powerupTime: 15,
    frenzyChance: 0.03
}

// Variables

const Game = {score: 0, direction: "right", $LSD: parseInt(localStorage.$LSD), snake: [], objects: {points: [], powerups: []}}
let ChangeDir = true

let FrenzyInterval
let WallInterval
let InvincibleInterval

// When document is loaded...

document.addEventListener("DOMContentLoaded", function() {
    // Scores

    const score = document.getElementById("score")
    const $LSD = document.getElementById("$LSD")

    if (!Game.$LSD || isNaN(Game.$LSD)) {
        Game.$LSD = 0
    }

    update_scores()

    // Start overlay effect

    const title = document.getElementById("start_title")
    const buttons = document.getElementById("start_buttons")

    setTimeout(function() {
        title.innerText = "super snake"
    }, 300)
    setTimeout(function() {
        buttons.style.display = "block"
    }, 600)

    // Event listeners

    start_listeners()
    help_listeners()
    game_listeners()
    game_over_listeners()
})

function start_game() {
    // Initialize game

    Game.score = 0
    Game.direction = "right"
    Game.snake = [750, 749, 748]
    Game.objects.points = [random_square(new Set(config.edgeSquares.concat(Game.snake).concat(Game.objects.points.concat(Game.objects.powerups))))]
    Game.objects.powerups = []
    Game.frenzy = false
    Game.wall = false
    Game.invincible = false

    update_game()

    // Game interval

    const game_interval = setInterval(function() {
        // Change direction

        ChangeDir = true

        // Move snake

        const status = move_snake()

        // Check status

        if (status[0] == "death") {
            // Game over

            clearInterval(game_interval)
            clearInterval(FrenzyInterval)
            clearInterval(WallInterval)
            clearInterval(InvincibleInterval)

            // Death

            setTimeout(function() {
                game_over()
            }, 500)
        } else if (status[0] == "point") {
            // Point collected

            Game.objects.points.splice(Game.objects.points.indexOf(status[1]), 1)

            // Update snake and score

            Game.snake.splice(1, 0, status[1])
            Game.score += 2
            Game.$LSD = Math.max(Game.$LSD, Game.score)
            localStorage.$LSD = Game.$LSD
            update_scores()

            // Regenerate point

            if (Game.objects.points.length == 0) {
                Game.objects.points.push(random_square(new Set(config.edgeSquares.concat(Game.snake).concat(Game.objects.points.concat(Game.objects.powerups)))))
            }
        } else if (status[0] == "powerup") {
            // Powerup collected

            delete_powerup(status[2])

            // Set powerup

            Game[status[1]] = true

            // Set timer

            if (status[1] == "frenzy") {
                // Activate frenzy timer

                activate_powerup("frenzy", "frenzy")
            } else if (status[1] == "wall") {
                // Activate wall timer

                activate_powerup("wall", "wall phaser")
            } else {
                // Activate invincibility

                activate_powerup("invincible", "invincibility")
            }
        }

        // Generate powerups

        if (Math.random() < config.powerupChance) {
            // Pick random powerup

            const powerup = config.powerups[Math.floor(Math.random() * config.powerups.length)]
            
            // Random point

            Game.objects.powerups.push([powerup, random_square(new Set(config.edgeSquares.concat(Game.snake).concat(Game.objects.points.concat(Game.objects.powerups))))])
        }

        // Frenzy points

        if (Game.frenzy) {
            if (Math.random() < config.frenzyChance) {
                Game.objects.points.push(random_square(new Set(config.edgeSquares.concat(Game.snake).concat(Game.objects.points.concat(Game.objects.powerups)))))
            }
        }

        // Update game

        update_game()
    }, config.tickspeed)
}

function random_square(blacklist) {
    // Complementary array

    const values = []
    for (let v = 0; v < 1620; v ++) {
        if (!blacklist.has(v)) {
            values.push(v)
        }
    }

    // Random value

    return values[Math.floor(Math.random() * values.length)]
}

function activate_powerup(powerup, activate_msg) {
    // Elements

    const activate = document.getElementById("activate")
    const activate_text = document.getElementById("activate_text")

    const timer = document.getElementById(`${powerup}_timer`)
    const linebreak = document.getElementById(`${powerup}_break`)

    // Activate display

    activate_text.innerHTML = `${activate_msg}<br>activated`
    activate_text.className = `${powerup}Activate`
    activate.style.display = "block"
    setTimeout(function() {
        activate.style.display = "none"
    }, 1000)

    // Configure interval

    if (powerup == "frenzy") {
        clearInterval(FrenzyInterval)
    } else if (powerup == "wall") {
        clearInterval(WallInterval)
    } else {
        clearInterval(InvincibleInterval)
    }

    // Display

    timer.innerText = `(${config.powerupTime}s)`
    timer.style.display = "inline"
    if (linebreak) {
        linebreak.style.display = "inline"
    }

    // Timer interval
    
    if (powerup == "frenzy") {
        let time = config.powerupTime
        FrenzyInterval = setInterval(function() {
            // Count down

            time --
            timer.innerText = `(${time}s)`

            // Check end

            if (time < 0) {
                // Display

                timer.style.display = "none"
                linebreak.style.display = "none"

                // End powerup

                Game[powerup] = false
                clearInterval(FrenzyInterval)

                // Check points

                if (Game.objects.points.length == 0) {
                    Game.objects.points.push(random_square(new Set(config.edgeSquares.concat(Game.snake).concat(Game.objects.points.concat(Game.objects.powerups)))))
                }
            }
        }, 1000)
    } else if (powerup == "wall") {
        let time = config.powerupTime
        WallInterval = setInterval(function() {
            // Count down

            time --
            timer.innerText = `(${time}s)`

            // Check end

            if (time < 0) {
                // Display

                timer.style.display = "none"
                linebreak.style.display = "none"

                // End powerup

                Game[powerup] = false
                clearInterval(WallInterval)
            }
        }, 1000)
    } else {
        let time = config.powerupTime
        InvincibleInterval = setInterval(function() {
            // Count down

            time --
            timer.innerText = `(${time}s)`

            // Check end

            if (time < 0) {
                // Display

                timer.style.display = "none"

                // End powerup

                Game[powerup] = false
                clearInterval(InvincibleInterval)
            }
        }, 1000)
    }
}

function delete_powerup(square) {
    for (let p = 0; p < Game.objects.powerups.length; p ++) {
        if (Game.objects.powerups[p][1] == square) {
            Game.objects.powerups.splice(p, 1)
            return
        }
    }
}

function update_scores() {
    // Elements

    const score = document.getElementById("score")
    const $LSD = document.getElementById("$LSD")

    // Display

    score.innerText = `score: ${Game.score}`
    $LSD.innerText = `$LSD: ${Game.$LSD}`
}

function update_game() {
    // Data

    const snake = Game.snake
    const points = Game.objects.points
    const powerups = Game.objects.powerups

    // Canvas

    const ctx = document.getElementById("canvas").getContext("2d")

    // Clear canvas

    ctx.clearRect(0, 0, config.gameWidth, config.gameHeight)

    // Draw snake

    ctx.fillStyle = "#FFFFFF"
    for (let s = 0; s < snake.length; s ++) {
        // Draw segment

        const coords = get_coords(snake[s])
        ctx.fillRect(coords[0] + 2, coords[1] + 2, 16, 16)
    }

    // Draw points

    for (let p = 0; p < points.length; p ++) {
        // Draw point

        const coords = get_coords(points[p])
        ctx.fillRect(coords[0] + 2, coords[1] + 2, 16, 16)
    }

    // Draw powerups

    for (let p = 0; p < powerups.length; p ++) {
        // Draw powerup

        const coords = get_coords(powerups[p][1])

        if (powerups[p][0] == "frenzy") {
            ctx.fillStyle = "#FF9D00"
        } else if (powerups[p][0] == "wall") {
            ctx.fillStyle = "#0091FF"
        } else {
            ctx.fillStyle = "#FF0000"
        }

        ctx.fillRect(coords[0] + 2, coords[1] + 2, 16, 16)
    }
}

function get_coords(square) {
    return [(square % 60) * 20, (Math.floor(square / 60)) * 20]
}

function move_snake() {
    // Calculate head

    let head = Game.snake[0]
    switch (Game.direction) {
        case "up":
            head -= 60
            break
        case "right":
            head ++
            break
        case "down":
            head += 60
            break
        case "left":
            head --
            break
    }

    // Out of bounds

    if (Game.wall) {
        if (head < 0 && Game.direction == "up") {
            // Top wall

            head += 1620
        } else if ((head + 1) % 60 == 0 && Game.direction == "left") {
            // Left wall

            head += 60
        } else if (head > 1619 && Game.direction == "down") {
            // Bottom wall

            head -= 1620
        } else if (head % 60 == 0 && Game.direction == "right") {
            // Right wall

            head -= 60
        }
    }

    // Calculate status

    const status = get_status(head)
    if (status[0] != "death") {
        // Adjust head

        if (status[0] == "point") {
            switch (Game.direction) {
                case "up":
                    head -= 60
                    break
                case "right":
                    head ++
                    break
                case "down":
                    head += 60
                    break
                case "left":
                    head --
                    break
            }
        }

        // Shift snake

        Game.snake.pop()
        Game.snake.unshift(head)
    }

    return status
}

function get_status(head) {
    if ((Game.snake.includes(head) && !Game.invincible) || (!Game.wall && check_wall(head))) {
        // Death

        return ["death"]
    } else if (Game.objects.points.includes(head)) {
        // Point collected

        return ["point", head]
    } else if (check_powerup(head)) {
        // Powerup collected
     
        return ["powerup"].concat(check_powerup(head))
    } else {
        return ["ok"]
    }
}

function check_wall(head) {
    if (head < 0 && Game.direction == "up") {
        // Top wall

        return true
    } else if ((head + 1) % 60 == 0 && Game.direction == "left") {
        // Left wall

        return true
    } else if (head > 1619 && Game.direction == "down") {
        // Bottom wall

        return true
    } else if (head % 60 == 0 && Game.direction == "right") {
        // Right wall

        return true
    }
}

function check_powerup(head) {
    for (let p = 0; p < Game.objects.powerups.length; p ++) {
        if (Game.objects.powerups[p][1] == head) {
            return Game.objects.powerups[p]
        }
    }
    return false
}

function game_over() {
    // Elements

    const game_over = document.getElementById("game_over")
    const game_over_scores = document.getElementById("game_over_scores")

    // Reset canvas

    Game.snake = []
    Game.objects.points = []
    Game.objects.powerups = []
    update_game()

    // Timer display

    document.getElementById("frenzy_timer").style.display = "none"
    document.getElementById("frenzy_break").style.display = "none"
    document.getElementById("wall_timer").style.display = "none"
    document.getElementById("wall_break").style.display = "none"
    document.getElementById("invincible_timer").style.display = "none"

    // Game over scores

    game_over_scores.innerHTML = `score: ${Game.score}<br>$LSD: ${Game.$LSD}`

    // Game over screen

    setTimeout(function() {
        game_over.style.display = "block"
    }, 200)
}

function start_listeners() {
    // Elements

    const start = document.getElementById("start")
    const play = document.getElementById("play")
    const help = document.getElementById("help")

    const game = document.getElementById("game")
    const help_screen = document.getElementById("help_screen")

    // Play click

    play.addEventListener("click", function(event) {
        if (event.isTrusted) {
            // Hide overlay

            start.style.display = "none"

            // Start game

            setTimeout(function() {
                start_game()
            }, 500)
        }
    })

    // Help click

    help.addEventListener("click", function(event) {
        if (event.isTrusted) {
            // Display

            game.style.display = "none"
            help_screen.style.display = "block"
        }
    })
}


function game_listeners() {
    // Keypress

    document.addEventListener("keydown", function(event) {
        if (event.isTrusted && ChangeDir) {
            // Check keycodes

            if (event.keyCode == 87 || event.keyCode == 38) {
                // Up

                if (Game.direction != "down") {
                    ChangeDir = false
                    Game.direction = "up"
                }
            } else if (event.keyCode == 65 || event.keyCode == 37) {
                // Left

                if (Game.direction != "right") {
                    ChangeDir = false
                    Game.direction = "left"
                }
            } else if (event.keyCode == 83 || event.keyCode == 40) {
                // Down

                if (Game.direction != "up") {
                    ChangeDir = false
                    Game.direction = "down"
                }
            } else if (event.keyCode == 68 || event.keyCode == 39) {
                // Right

                if (Game.direction != "left") {
                    ChangeDir = false
                    Game.direction = "right"
                }
            }
        }
    })
}

function help_listeners() {
    // Elements

    const back = document.getElementById("help_back")

    const game = document.getElementById("game")
    const help_screen = document.getElementById("help_screen")

    // Back click

    back.addEventListener("click", function(event) {
        if (event.isTrusted) {
            // Display

            help_screen.style.display = "none"
            game.style.display = "block"
        }
    })
}

function game_over_listeners() {
    // Elements

    const game_over = document.getElementById("game_over")
    const retry = document.getElementById("game_over_retry")

    // Retry click

    game_over_retry.addEventListener("click", function(event) {
        if (event.isTrusted) {
            // Hide game over

            game_over.style.display = "none"

            // Start game

            setTimeout(function() {
                start_game()
            }, 500)
        }
    })
}