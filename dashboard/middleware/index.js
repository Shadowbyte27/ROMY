const { threadsData } = global.db;

function isPostMethod(req) {
	return req.method == "POST";
}

module.exports = function (checkAuthConfigDashboardOfThread) {
	return {
		isAuthenticated(req, res, next) {
			if (req.isAuthenticated())
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "🎧❌ Oups ! Tu n’es pas connecté… La magie ne fonctionne que pour les initiés🪶🧘🏻‍♂️ !"
				});

			req.flash("errors", { msg: "🔒 Connecte-toi, aventurier ! La porte secrète ne s’ouvre qu’aux héros loggés." });
			res.redirect(`/login?redirect=${req.originalUrl}`);
		},

		unAuthenticated(req, res, next) {
			if (!req.isAuthenticated())
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message:"🎧✨ Mais tu es déjà dans la partie ! Pas besoin d’en mettre une deuxième couche🪶🧘🏻‍♂️."
				});

			res.redirect("/");
		},

		isVeryfiUserIDFacebook(req, res, next) {
			if (req.user.facebookUserID)
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "🕵️‍♂️🔍 L’ID Facebook est manquant ! Mission impossible sans ton identité secrète🪶🧘🏻‍♂️."
				});

			req.flash("errors", { msg: "🕵️‍♂️ Tu dois valider ton ID Facebook avant de partir à l’aventure ici !" });
			res.redirect(`/verifyfbid?redirect=${req.originalUrl}`);
		},

		isWaitVerifyAccount(req, res, next) {
			if (req.session.waitVerifyAccount)
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "⏳🛑 Patience, jeune padawan ! Ton compte attend encore le signal des étoiles🪶🧘🏻‍♂️."
				});

			res.redirect("/register");
		},

		async checkHasAndInThread(req, res, next) {
			const userID = req.user.facebookUserID;
			const threadID = isPostMethod(req) ? req.body.threadID : req.params.threadID;
			const threadData = await threadsData.get(threadID);

			if (!threadData) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "📡❓ Ce groupe est introuvable… Serait-il caché dans une autre dimension🪶🧘🏻‍♂️ ?"
					});

				req.flash("errors", { msg: "🎧❌👻 Ce groupe n’existe pas, ou alors il est invisible 🪶🧘🏻‍♂️!" });
				return res.redirect("/dashboard");
			}

			const findMember = threadData.members.find(m => m.userID == userID && m.inGroup == true);
			if (!findMember) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "🎧❌🙅‍♂️ Tu n’as pas la clé magique pour ce groupe. Rejoins-le ou demande à Gandalf🪶🧘🏻‍♂️ !"
					});

				req.flash("errors", { msg: "🚷 Tu n’es pas dans ce groupe… Impossible de rentrer sans le badge VIP !" });
				return res.redirect("/dashboard");
			}
			req.threadData = threadData;
			next();
		},

		async middlewareCheckAuthConfigDashboardOfThread(req, res, next) {
			const threadID = isPostMethod(req) ? req.body.threadID : req.params.threadID;
			if (checkAuthConfigDashboardOfThread(threadID, req.user.facebookUserID))
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "🎧❌ Pas assez de points charisme pour modifier ce groupe🪶🧘🏻‍♂️ !"
				});

			req.flash("errors", {
				msg: "🎧👑 Seuls les admins ou les membres élus au Panthéon peuvent bidouiller ce dashboard🪶🧘🏻‍♂️ !"
			});
			return res.redirect("/dashboard");
		},

		async isAdmin(req, res, next) {
			const userID = req.user.facebookUserID;
			if (!global.GoatBot.config.adminBot.includes(userID)) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "🎧❌ Seuls le boss এꔰꜛ.`EMPEREUR👑ROMEO`.ꜛꗄꔰ a accès à cette fonction tu n'es qu'un simple sujet reste à ta place gamin(e)🚮🪶🧘🏻‍♂️ !"
					});

				req.flash("errors", { msg: "🎧❌Tu n’es pas admin. Il te faudrait la baguette magique de ton village 🪶🧘🏻‍♂️!" });
				return res.redirect("/dashboard");
			}
			next();
		}
	};
};
