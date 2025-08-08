export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { players, link, grouped } = req.body || {};
  if (!grouped || typeof grouped !== 'object') return res.status(400).end();

  const webhook = process.env.WEBHOOK_URL;
  if (!webhook) return res.status(500).end();

  const rarityOrder = ["Secret", "Mythic", "Legendary", "Epic", "Rare", "Common"];
  const rarityIcons = {
    Secret: "🟣 Secret",
    Mythic: "🔵 Mythic",
    Legendary: "🟠 Legendary",
    Epic: "🟤 Epic",
    Rare: "🟢 Rare",
    Common: "⚪ Common"
  };

  const fields = [];

  for (const [owner, items] of Object.entries(grouped)) {
    const sorted = [...items].sort((a, b) => {
      const aIndex = rarityOrder.indexOf(a.rarity) === -1 ? 99 : rarityOrder.indexOf(a.rarity);
      const bIndex = rarityOrder.indexOf(b.rarity) === -1 ? 99 : rarityOrder.indexOf(b.rarity);
      return aIndex - bIndex;
    });

    let list = '';
    for (const item of sorted) {
      const icon = rarityIcons[item.rarity] || item.rarity || "❓";
      const name = item.displayName || "Unknown";
      const gen = item.generation || "??";
      list += `• ${icon}\n  👤 ${name} | 💰 Gen ${gen}\n`;
    }

    if (list) {
      fields.push({
        name: `🎯 ${owner}'s Plot`,
        value: list.trim(),
        inline: false
      });
    }
  }

  const count = parseInt(players) || 0;
  const playerLine = count >= 8 ? `🔴 ${count}/8` : `🟢 ${count}/8`;

  fields.push({
    name: '🧍 Players Inside',
    value: playerLine,
    inline: true
  });

  const embed = {
  title: 'Brainrot Found!',
  description: link ? `🔗 [Click here to join](${link})` : 'No join link available.',
  color: 0x2ecc71,
  fields,
  timestamp: new Date().toISOString(),
  thumbnail: {
    url: 'https://media.discordapp.net/attachments/1279117246836375593/1384782109732024400/brainrot.png'
  }
};
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    return res.status(200).end();
  } catch {
    return res.status(500).end();
  }
}
