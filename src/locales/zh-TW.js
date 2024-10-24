export default {
    // 通用
    common: {
        confirm: '確認',
        cancel: '取消',
        save: '儲存',
        delete: '刪除',
        edit: '編輯',
        create: '新增',
        search: '搜尋',
        reset: '重置',
        back: '返回',
        loading: '載入中...',
        noData: '暫無資料',
        success: '操作成功',
        failed: '操作失敗',
        required: '此欄位為必填',
        more: '更多',
        all: '全部',
        yes: '是',
        no: '否',
        status: '狀態',
        actions: '操作'
    },

    // 驗證訊息
    validation: {
        required: '{field}為必填欄位',
        email: '請輸入有效的電子郵件',
        phone: '請輸入有效的手機號碼',
        minLength: '{field}不能少於{length}個字符',
        maxLength: '{field}不能超過{length}個字符',
        password: '密碼必須包含至少8個字符，包括字母和數字',
        passwordConfirm: '兩次輸入的密碼不一致',
        integer: '請輸入整數',
        number: '請輸入數字',
        date: '請輸入有效的日期',
        url: '請輸入有效的網址'
    },

    // 錯誤訊息
    error: {
        network: '網路連接錯誤，請檢查網路設置',
        server: '伺服器錯誤，請稍後再試',
        unauthorized: '未授權，請重新登入',
        forbidden: '無權限訪問',
        notFound: '找不到頁面',
        timeout: '請求超時',
        unknown: '未知錯誤'
    },

    // 登入/註冊
    auth: {
        login: '登入',
        register: '註冊',
        logout: '登出',
        email: '電子郵件',
        password: '密碼',
        confirmPassword: '確認密碼',
        forgotPassword: '忘記密碼',
        resetPassword: '重設密碼',
        rememberMe: '記住我',
        loginSuccess: '登入成功',
        registerSuccess: '註冊成功',
        logoutSuccess: '登出成功',
        profile: '個人資料',
        changePassword: '修改密碼',
        oldPassword: '舊密碼',
        newPassword: '新密碼',
        confirmNewPassword: '確認新密碼'
    },

    // 會員管理
    member: {
        memberList: '會員列表',
        memberInfo: '會員資訊',
        memberID: '會員編號',
        name: '姓名',
        email: '電子郵件',
        phone: '手機號碼',
        role: '角色',
        registerDate: '註冊日期',
        lastLoginTime: '最後登入時間',
        status: '狀態',
        active: '啟用',
        inactive: '停用'
    },

    // 市民卡管理
    citizenCard: {
        cardList: '市民卡列表',
        cardInfo: '市民卡資訊',
        cardNumber: '卡號',
        holderName: '持卡人姓名',
        cardType: '卡片類型',
        bindStatus: '綁定狀態',
        bound: '已綁定',
        unbound: '未綁定',
        normalCard: '一般卡',
        seniorCard: '敬老卡',
        loveCard: '愛心卡',
        studentCard: '學生卡'
    },

    // 電影管理
    movie: {
        movieList: '電影列表',
        movieInfo: '電影資訊',
        movieName: '電影名稱',
        showTime: '放映時間',
        duration: '片長',
        category: '類別',
        description: '描述',
        venue: '場地',
        seatNumber: '座位號碼',
        availableSeats: '可用座位',
        price: '票價',
        status: '狀態',
        upcoming: '即將上映',
        showing: '上映中',
        ended: '已下檔'
    },

    // 場地管理
    venue: {
        venueList: '場地列表',
        venueInfo: '場地資訊',
        venueName: '場地名稱',
        seatCount: '座位數',
        address: '地址',
        capacity: '容納人數',
        status: '狀態',
        available: '可用',
        maintenance: '維護中',
        disabled: '停用'
    },

    // 訂位管理
    booking: {
        bookingList: '訂位列表',
        bookingInfo: '訂位資訊',
        bookingID: '訂位編號',
        movieName: '電影名稱',
        showTime: '放映時間',
        seatNumber: '座位號碼',
        bookingTime: '訂位時間',
        status: '狀態',
        booked: '已預訂',
        cancelled: '已取消',
        completed: '已完成',
        price: '票價',
        paymentStatus: '付款狀態',
        paid: '已付款',
        unpaid: '未付款',
        refunded: '已退款'
    },

    // 優惠管理
    benefit: {
        benefitList: '優惠列表',
        benefitInfo: '優惠資訊',
        benefitName: '優惠名稱',
        benefitType: '優惠類型',
        description: '描述',
        validUntil: '有效期限',
        usageLimit: '使用次數限制',
        usageCount: '已使用次數',
        status: '狀態',
        active: '使用中',
        expired: '已過期',
        busDiscount: '公車優惠',
        storeDiscount: '特約商店折扣',
        pointsEvent: '政府活動積點',
        lotteryEvent: '抽獎參與'
    },

    // 電子錢包
    wallet: {
        balance: '餘額',
        deposit: '儲值',
        withdraw: '提領',
        transfer: '轉帳',
        transaction: '交易記錄',
        transactionType: '交易類型',
        amount: '金額',
        description: '說明',
        transactionTime: '交易時間',
        dailyLimit: '每日限額',
        singleLimit: '單筆限額',
        paymentMethod: '支付方式',
        creditCard: '信用卡',
        bankTransfer: '銀行轉帳',
        depositSuccess: '儲值成功',
        withdrawSuccess: '提領成功',
        transferSuccess: '轉帳成功'
    }
}