local showing = false
local currentPuzzlePromise = nil  -- for one-shot minigame export

-- ============================
-- HELPER: OPEN FLOW PUZZLE
-- ============================

local function OpenFlow(gridSize, seconds)
    if gridSize then
        SendNUIMessage({
            action = "setGridSize",
            size = tonumber(gridSize)
        })
    end

    if seconds then
        SendNUIMessage({
            action = "setTimer",
            time = tonumber(seconds)
        })
    end

    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open" })
    showing = true
end

-- ============================
-- COMMANDS (DEV / TESTING)
-- ============================

-- /flow              -> 6x6, 15s
-- /flow 7            -> 7x7, 15s
-- /flow 9 25         -> 9x9, 25s
RegisterCommand("flow", function(_, args)
    local grid = tonumber(args[1]) or 6
    local time = tonumber(args[2]) or 15
    OpenFlow(grid, time)
end)

-- Quick shortcuts if you want to spam different sizes:
RegisterCommand("flow5", function()
    OpenFlow(5, 8)   -- 5x5, 8s
end)

RegisterCommand("flow6", function()
    OpenFlow(6, 10)  -- 6x6, 10s
end)

RegisterCommand("flow7", function()
    OpenFlow(7, 15)  -- 7x7, 15s
end)

RegisterCommand("flow8", function()
    OpenFlow(8, 20)  -- 8x8, 20s
end)

RegisterCommand("flow9", function()
    OpenFlow(9, 25)  -- 9x9, 25s
end)

-- ============================
-- DEBUG FROM NUI
-- ============================

RegisterNUICallback("debug", function(data, cb)
    local msg = "[cr-flow DEBUG] "
    if data and data.message then
        msg = msg .. tostring(data.message)
    else
        msg = msg .. "(no message)"
    end

    if data and data.info then
        -- crude print of extra info; avoid json.encode to keep it simple
        msg = msg .. " | info=" .. tostring(data.info)
    end

    print(msg)
    cb("ok")
end)

-- ============================
-- CLOSE (manual / ESC key)
-- ============================

RegisterNUICallback("close", function(_, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false

    -- If someone is awaiting the puzzle, treat a manual close as failure
    if currentPuzzlePromise then
        currentPuzzlePromise:resolve(false)
        currentPuzzlePromise = nil
    end

    cb("ok")
end)

-- ============================
-- SUCCESS (player solved puzzle)
-- Called after 2s delay in JS checkComplete()
-- ============================

RegisterNUICallback("success", function(_, cb)
    print("PUZZLE COMPLETE!")
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false

    -- notify server that player completed successfully
    TriggerServerEvent("flow:puzzleCompleted")

    -- resolve active promise (if any) as success
    if currentPuzzlePromise then
        currentPuzzlePromise:resolve(true)
        currentPuzzlePromise = nil
    end

    cb("ok")
end)

-- ============================
-- TIMER FAIL (JS timer ran out)
-- timer.js -> fetch(.../fail)
-- ============================

RegisterNUICallback("fail", function(_, cb)
    print("FLOW FAILED (timer ran out)")

    -- 🔊 play the fail sound for timeout
    exports['cr-flow']:FailSound()

    -- close UI
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
    showing = false

    -- tell server you failed (if you want to hook this)
    TriggerServerEvent("flow:puzzleFailed")

    -- resolve active promise (if any) as failure
    if currentPuzzlePromise then
        currentPuzzlePromise:resolve(false)
        currentPuzzlePromise = nil
    end

    cb("ok")
end)

-- ============================
-- NUI → SOUND TRIGGERS
-- ============================

RegisterNUICallback("pair", function(_, cb)
    exports['cr-flow']:PairSound()
    cb("ok")
end)

-- this one is for pipe-overwrite / manual fail sound
RegisterNUICallback("failsound", function(_, cb)
    exports['cr-flow']:FailSound()
    cb("ok")
end)

RegisterNUICallback("complete", function(_, cb)
    exports['cr-flow']:PuzzleCompleteSound()
    cb("ok")
end)

-- ============================
-- SOUND EXPORTS (UPDATED)
-- ============================

-- When a pair is successfully linked
exports('PairSound', function()
    PlaySoundFrontend(-1, "Pin_Good", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- When a link breaks or is overwritten / timer fail
exports('FailSound', function()
    PlaySoundFrontend(-1, "Pin_Bad", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- When the entire puzzle is completed
exports('PuzzleCompleteSound', function()
    PlaySoundFrontend(-1, "Hack_Success", "DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS", 1)
end)

-- ============================
-- EXPORT: Set puzzle time limit
-- Called from any other client script:
--   exports['cr-flow']:SetFlowTimer(25)
-- ============================

exports('SetFlowTimer', function(seconds)
    SendNUIMessage({
        action = "setTimer",
        time = tonumber(seconds)
    })
end)

-- ============================
-- EXPORT: Set puzzle grid size
-- Called from any other client script:
--   exports['cr-flow']:SetFlowGridSize(7)
-- ============================

exports('SetFlowGridSize', function(size)
    SendNUIMessage({
        action = "setGridSize",
        size = tonumber(size)
    })
end)

-- ============================
-- EXPORT: One-shot minigame (returns true/false)
--   local ok = exports['cr-flow']:PlayFlowPuzzle(7, 18)
-- ============================

exports('PlayFlowPuzzle', function(gridSize, seconds)
    -- Prevent double-opening if something is already running
    if currentPuzzlePromise then
        print("[cr-flow] PlayFlowPuzzle called while another puzzle is active")
        return false
    end

    local p = promise.new()
    currentPuzzlePromise = p

    if gridSize then
        SendNUIMessage({
            action = "setGridSize",
            size = tonumber(gridSize)
        })
    end

    if seconds then
        SendNUIMessage({
            action = "setTimer",
            time = tonumber(seconds)
        })
    end

    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open" })
    showing = true

    local result = Citizen.Await(p)
    -- `success`/`fail`/`close` callbacks will resolve the promise
    -- and clear currentPuzzlePromise
    return result and true or false
end)

