const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "1.0",
    author: "xnil6x",
    countDown: 8,
    role: 2,
    shortDescription: "Gère les demandes d'amis avec style",
    longDescription: "Accepte ou refuse les demandes d'amis avec une interface élégante",
    category: "Utility",
    guide: {
      en: "{pn} [add|del] [number|all]"
    }
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    const args = event.body.trim().toLowerCase().split(/\s+/);

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    }
    else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }
    else {
      return api.sendMessage(`🎧❌ Commande invalide. Utilisation : <add|del> <number|all> 🪶🧘🏻‍♂️`, event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);

    if (args[1] === "all") {
      targetIDs = Array.from({ length: listRequest.length }, (_, i) => i + 1);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const user = listRequest[parseInt(stt) - 1];
      if (!user) {
        failed.push(`🎧❌ Demande #${stt} introuvable 🪶🧘🏻‍♂️`);
        continue;
      }
      form.variables.input.friend_requester_id = user.node.id;
      form.variables = JSON.stringify(form.variables);
      newTargetIDs.push(user);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = JSON.parse(form.variables);
    }

    const results = await Promise.allSettled(promiseFriends);
    
    results.forEach((result, index) => {
      const user = newTargetIDs[index];
      if (result.status === "fulfilled" && !JSON.parse(result.value).errors) {
        success.push(`🎧☑️ ${user.node.name} (${user.node.id}) accepté(e) 🪶🧘🏻‍♂️`);
      } else {
        failed.push(`🎧❌ ${user.node.name} (${user.node.id}) refusé(e) 🪶🧘🏻‍♂️`);
      }
    });

    let replyMsg = "";
    if (success.length > 0) {
      replyMsg += `🎧☑️ ${success.length} demande(s) ${args[0] === 'add' ? "acceptée(s)" : "refusée(s)"} 🪶🧘🏻‍♂️\n${success.join("\n")}\n\n`;
    }
    if (failed.length > 0) {
      replyMsg += `🎧❌ ${failed.length} demande(s) non traitée(s) 🪶🧘🏻‍♂️\n${failed.join("\n")}`;
    }

    if (replyMsg) {
      api.sendMessage(replyMsg, event.threadID, event.messageID);
    } else {
      api.unsendMessage(messageID);
      api.sendMessage(`🎧❌ Aucune demande valide n'a été traitée 🪶🧘🏻‍♂️`, event.threadID);
    }

    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };
      
      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;
      
      if (!listRequest || listRequest.length === 0) {
        return api.sendMessage(`🎧☑️ Tu n'as aucune demande d'ami en attente 🪶🧘🏻‍♂️`, event.threadID);
      }

      let msg = `🎧☑️ Demandes d'amis en attente 🪶🧘🏻‍♂️:\n\n`;
      listRequest.forEach((user, index) => {
        msg += `🎧☑️ ${index + 1}. ${user.node.name}\n`;
        msg += `   🆔: ${user.node.id}\n`;
        msg += `   🔗: ${user.node.url.replace("www.facebook", "fb")}\n`;
        msg += `   ⏰: ${moment(user.time * 1009).tz("Europe/Paris").format("DD/MM/YYYY HH:mm:ss")}\n\n`;
      });

      msg += "🎧☑️ Réponds avec 🪶🧘🏻‍♂️:\n"
           + "• 'add <number>' pour accepter\n"
           + "• 'del <number>' pour refuser\n"
           + "• 'add all' pour tout accepter\n"
           + "• 'del all' pour tout refuser\n\n"
           + "⏳ Ce menu s'auto-supprime dans 2 minutes 🪶🧘🏻‍♂️";

      api.sendMessage(msg, event.threadID, (e, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 2 * 60 * 1000) // 2 minutes
        });
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage(`🎧❌ Erreur lors de la récupération des demandes d'amis 🪶🧘🏻‍♂️`, event.threadID);
    }
  }
};
