const fs = require('fs');
const google = require('googlethis');

async function main() {
  let content = fs.readFileSync('src/data/mock.ts', 'utf-8');
  const products = [
    'Cervical soft collar',
    'Shoulder immobilizer',
    'Tennis elbow splint',
    'Immobilizer pouch elbow',
    'Thumbs spica',
    'Buddy splint',
    'Cock up splint',
    'Wrist extensor',
    'Foot wear silicon gel',
    'Finger extensor',
    'Lumbosacral belt',
    'Posture correction belt',
    'Pelvic traction kit',
    'Cervical traction kit',
    'Hinge knee brace',
    'Varus knee brace right and left',
    'Anklet',
    'Hallux finger splint',
    'Soft foot wear',
    'Creep bandage hand and leg'
  ];

  for (const product of products) {
    try {
      const options = {
        page: 0,
        safe: false,
        additional_params: {
          hl: 'en'
        }
      };
      
      const response = await google.image(product + ' orthopedic equipment', options);
      if (response && response.length > 0) {
        const imageUrl = response[0].url;
        console.log(product, '=>', imageUrl);
        const regex = new RegExp(`(name:\\s*'${product}'.*?image:\\s*')/placeholder.svg(')`);
        content = content.replace(regex, `$1${imageUrl}$2`);
      }
    } catch (e) {
      console.log('Error fetching', product, e.message);
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync('src/data/mock.ts', content);
  console.log('Done!');
}
main();
