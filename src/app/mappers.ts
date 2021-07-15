import { ItemId } from './item.class';

export const mapIdToName = (itemId: ItemId): string => {
  switch (itemId) {
    case 168583:
      return "Widowbloom";
    case 168586:
      return "Rising Glory";
    case 168589:
      return "Marrowroot";
    case 169701:
      return "Death Blossom";
    case 170554:
      return "Vigil's Torch";
    case 171263:
      return "Potion of Soul Purity";
    case 171264:
      return "Potion of Shaded Sight";
    case 171266:
      return "Potion of the Hidden Spirit";
    case 171267:
      return "Spiritual Healing Potion";
    case 171268:
      return "Spiritual Mana Potion";
    case 171269:
      return "Spiritual Rejuvenation Potion";
    case 171270:
      return "Potion of Spectral Agility";
    case 171271:
      return "Potion of Hardened Shadows";
    case 171272:
      return "Potion of Spiritual Clarity";
    case 171274:
      return "Potion of Spectral Stamina";
    case 171275:
      return "Potion of Spectral Strength";
    case 171278:
      return "Spectral Flask of Stamina";
    case 171287:
      return "Ground Death Blossom";
    case 171288:
      return "Ground Vigil's Torch";
    case 171289:
      return "Ground Widowbloom";
    case 171290:
      return "Ground Marrowroot";
    case 171291:
      return "Ground Rising Glory";
    case 171292:
      return "Ground Nightshade";
    case 171301:
      return "Spiritual Anti-Venom";
    case 171315:
      return "Nightshade";
    case 171349:
      return "Potion of Phantom Fire";
    case 171350:
      return "Potion of Divine Awakening";
    case 171351:
      return "Potion of Deathly Fixation";
    case 171352:
      return "Potion of Empowered Exorcisms";
    case 171370:
      return "Potion of Specter Swiftness";
    case 171428:
      return "Shadowghast Ingot";
    case 176811:
      return "Potion of Sacrificial Anima";
    case 180457:
      return "Shadestone";
    case 180732:
      return "Rune Etched Vial";
    case 183823:
      return "Potion of Unhindered Passing";
    case 183950:
      return "Distilled Death Extract";
    case 184090:
      return "Potion of the Psychopomp's Speed";
    default:
      return `UNKNOWN <<${itemId}>>;`
  }

}

