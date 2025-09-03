module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "bật/tắt chế độ chỉ quản trị của viên nhóm mới có thể sử dụng bot",
			en: "turn on/off only admin box can use bot"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [on | off]: bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot"
				+ "\n   {pn} noti [on | off]: bật/tắt thông báo khi người dùng không phải là quản trị viên nhóm sử dụng bot",
			en: "   {pn} [on | off]: turn on/off the mode only admin of group can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
		}
	},

	langs: {
		vi: {
			turnedOn: "🎧☑️ Mode admin only activé ! 🪶🧘🏻‍♂️",
			turnedOff: "🎧☑️ Mode admin only désactivé ! 🪶🧘🏻‍♂️",
			turnedOnNoti: "🎧☑️ Notification pour les non-admins activée ! 🪶🧘🏻‍♂️",
			turnedOffNoti: "🎧☑️ Notification pour les non-admins désactivée ! 🪶🧘🏻‍♂️",
			syntaxError: "🎧❌ Syntaxe incorrecte, utilise {pn} on ou {pn} off 🪶🧘🏻‍♂️",
			notAdmin: "🎧❌ Désolé… Seul l'Empereur Romeo et ses admin privilégiés peuvent utiliser le bot ! 😏🪶🧘🏻‍♂️\nFais une offrande, peut-être qu’il t’accordera sa bénédiction ! 👑"
		},
		en: {
			turnedOn: "🎧☑️ Admin-only mode enabled! 🪶🧘🏻‍♂️",
			turnedOff: "🎧☑️ Admin-only mode disabled! 🪶🧘🏻‍♂️",
			turnedOnNoti: "🎧☑️ Notification for non-admins enabled! 🪶🧘🏻‍♂️",
			turnedOffNoti: "🎧☑️ Notification for non-admins disabled! 🪶🧘🏻‍♂️",
			syntaxError: "🎧❌ Syntax error, only use {pn} on or {pn} off 🪶🧘🏻‍♂️",
			notAdmin: "🎧❌ Sorry... Only Emperor Romeo and his chosen admins can use the bot! 😏🪶🧘🏻‍♂️\nMake an offering, maybe he’ll bless you! 👑"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	},

	// Optionally, export the "notAdmin" message for use elsewhere if needed
	notAdminMessage: function (lang) {
		const langs = {
			vi: "🎧❌ Désolé… Seul l'Empereur Romeo et ses admin privilégiés peuvent utiliser le bot ! 😏🪶🧘🏻‍♂️\nFais une offrande, peut-être qu’il t’accordera sa bénédiction ! 👑",
			en: "🎧❌ Sorry... Only Emperor Romeo and his chosen admins can use the bot! 😏🪶🧘🏻‍♂️\nMake an offering, maybe he’ll bless you! 👑"
		};
		return langs[lang] || langs.en;
	}
};
