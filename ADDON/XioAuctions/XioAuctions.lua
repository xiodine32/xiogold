local _, xa = ...
local private = { items = {}, latest = {} }
local XioAuctionsFrame = nil
local toSearch = {}
local searchList = nil
local handler = nil

local function DoScanAuction()
    if next(searchList) == nil then
        XioAuctions_Run()
        handler:Cancel()
        handler = nil
        return
    end
    head = table.remove(searchList, 1)
    local itemKey = C_AuctionHouse.MakeItemKey(head)

    _, sName = GetItemInfo(head)
    print(format('> %s %d/%d', sName, #searchList, #toSearch))
    C_AuctionHouse.SendSearchQuery(itemKey, {}, false)
end

local function ScanAuctions()
    if not handler then
        print("searching alchemy")
        handler = C_Timer.NewTicker(1, DoScanAuction)
        toSearch = { 171276,180457,171287,171288,171289,171290,171291,171428,171292,171285,171286,169701,171315,168586,168589,168583,170554,171278,171270,171273,171274,171275,171351,171352,171350,171349,176811,171271,171272,184090,171370,171263,183823,171264,171266,171301,171269,171267,171268 }
        searchList  = { 171276,180457,171287,171288,171289,171290,171291,171428,171292,171285,171286,169701,171315,168586,168589,168583,170554,171278,171270,171273,171274,171275,171351,171352,171350,171349,176811,171271,171272,184090,171370,171263,183823,171264,171266,171301,171269,171267,171268 }
        return true
    end
    return false
end

function XioAuctions_Gold(value)
	if value < 0 then
		return '-' .. GetCoinTextureString(-value)
	else
		return GetCoinTextureString(value)
	end
end

function XioAuctions_OnLoad(self)
	print("XioAuctions_OnLoad")
	self:RegisterEvent("AUCTION_HOUSE_SHOW")
	self:RegisterEvent("AUCTION_HOUSE_CLOSED")
	-- self:RegisterEvent("AUCTION_HOUSE_BROWSE_RESULTS_UPDATED")
	self:RegisterEvent("COMMODITY_SEARCH_RESULTS_UPDATED")
	self:RegisterEvent("ITEM_SEARCH_RESULTS_UPDATED")
end

function XioAuctions_Show()
	if not private.hasShown then
		local function GetXioAuctionsPrice(itemLink)
			local itemId = GetItemInfoInstant(itemLink)
			return private.latest and private.latest[itemId] or nil
		end
		private.hasShown = true
		local tabId = AuctionHouseFrame.numTabs + 1
		local tab = CreateFrame("Button", "AuctionFrameTab"..tabId, AuctionHouseFrame, "AuctionHouseFrameTabTemplate")
		tab:Hide()
		tab:SetID(tabId)
		tab:SetText("XioAuctions")
		tab:SetNormalFontObject(GameFontHighlightSmall)
		tab:SetPoint("LEFT", AuctionHouseFrame.Tabs[tabId - 1], "RIGHT", 0, 30)
		tinsert(AuctionHouseFrame.Tabs, tab)
		tab:Show()
		PanelTemplates_SetNumTabs(AuctionHouseFrame, tabId)
		PanelTemplates_EnableTab(AuctionHouseFrame, tabId)
		tab:SetScript("OnClick", XioAuctions_Run)
	end
end

function XioAuctions_Run()
	if not XioAuctionsFrame then
	    if ScanAuctions() then
	        return
        end
		print('XioAuctions - dialog')
		local f = CreateFrame("Frame", "XioAuctionsFrame", UIParent, "DialogBoxFrame")
		f:SetSize(400, 300)
		f:SetBackdrop({
	      bgFile = "Interface\\DialogFrame\\UI-DialogBox-Background",
	      edgeFile = "Interface\\PVPFrame\\UI-Character-PVP-Highlight",
	      edgeSize = 16,
	      insets = { left = 8, right = 8, top = 8, bottom = 8 },
	    })

		-- scroll frame
	    local sf = CreateFrame("ScrollFrame", "XioAuctionsScrollFrame", f, "UIPanelScrollFrameTemplate")
	    sf:SetPoint("LEFT", 16, 0)
	    sf:SetPoint("RIGHT", -32, 0)
	    sf:SetPoint("TOP", 0, -32)
	    sf:SetPoint("BOTTOM", XioAuctionsFrameButton, "TOP", 0, 0)

	    -- edit box
	    local eb = CreateFrame("EditBox", "XioAuctionsEditBox", XioAuctionsScrollFrame)
	    eb:SetSize(sf:GetSize())
	    eb:SetMultiLine(true)
	    eb:SetAutoFocus(true)
	    eb:SetFontObject("ChatFontNormal")
	    eb:SetScript("OnEscapePressed",
            function()
                f:Hide()
                wipe(private.items)
            end
	    )
	    sf:SetScrollChild(eb)
	    XioAuctionsFrame = f
	end
	local x = ''
	for k,v in pairs(private.items) do
		x = x .. k .. "," .. v .. "\n"
	end
	x = strsub(x, 1, strlen(x) - 1)
  	XioAuctionsEditBox:SetText(x)
  	XioAuctionsEditBox:HighlightText()
  	XioAuctionsFrame:Show()
end

function XioAuctions_OnEvent(self, event, ...)
	if event == "AUCTION_HOUSE_SHOW" then
		XioAuctions_Show()
	elseif event == "AUCTION_HOUSE_CLOSED" then
		-- nothing
	elseif event == "COMMODITY_SEARCH_RESULTS_UPDATED" then
		local itemId = ...
		private.items[itemId] = ""
		for i = 1, C_AuctionHouse.GetNumCommoditySearchResults(itemId) do
		 	local result = C_AuctionHouse.GetCommoditySearchResultInfo(itemId, i)
		 	if private.items[itemId] == "" then
		 		private.latest[itemId] = result.unitPrice
		 	end
		 	private.items[itemId] = private.items[itemId] .. result.quantity .. "&" .. result.unitPrice .. "|"
    	end
		_, sName = GetItemInfo(itemId)
		newValue = private.latest[itemId]
        print('>>>', sName, XioAuctions_Gold(newValue))
    elseif event == "ITEM_SEARCH_RESULTS_UPDATED" then
	    -- nothing
	else
		print('Xioauctions - event', event, ...)
	end
end

function XioAuctions_OnUpdate(self, elapsed)
    -- nothing
end


SLASH_CMDS1 = "/xioauctions"
SLASH_CMDS2 = "/xioa"
SlashCmdList["CMDS"] = XioAuctions_Run
