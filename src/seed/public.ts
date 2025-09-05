import { listBreedersPublic, saveBreederPublic } from '../state/breeders.public.store'
import { addReview, moderate } from '../state/reviews.public.store'
import { addQuestion, answerQuestion } from '../state/qa.public.store'
import { addQueensBatch } from '../state/queens.store'

export function seedPublic(): void {
  try {
    // Seed breeders if absent
    if (listBreedersPublic().length < 5) {
      const now = new Date().toISOString()
      const demo = [
        { breederId:'B3', slug:'ua-21-karpaty', displayName:'Карпати Патока', regionCode:'UA-21', breedCodes:['carpatica'], badges:['verified' as const], stats:{ sales:55, queens:30, years:6, rating:4.4 }, createdAt: now, updatedAt: now },
        { breederId:'B4', slug:'ua-51-bakfast-lab', displayName:'Bakfast Lab', regionCode:'UA-51', breedCodes:['buckfast'], badges:['research' as const], stats:{ sales:40, queens:20, years:4, rating:4.1 }, createdAt: now, updatedAt: now },
        { breederId:'B5', slug:'ua-32-steppe', displayName:'Степова Пасіка', regionCode:'UA-32', breedCodes:['local'], badges:['union' as const], stats:{ sales:25, queens:15, years:3, rating:3.9 }, createdAt: now, updatedAt: now },
      ]
      demo.forEach(saveBreederPublic)
    }
    // Seed few public reviews/questions if absent
    const breeders = listBreedersPublic()
    const first = breeders[0]
    if (first) {
      const r1 = addReview({ breederId: first.breederId, author:{ name:'Гість' }, rating: 5, text: 'Все чітко, рекомендую!' })
      const r2 = addReview({ breederId: first.breederId, author:{ name:'Олег' }, rating: 4, text: 'Хороша якість, трішки затримались.' })
      addReview({ breederId: first.breederId, author:{ name:'Ірина' }, rating: 3, text: 'Очікувала швидше' })
      moderate(r1.id, 'approved'); moderate(r2.id, 'approved') // r3 pending
      const q1 = addQuestion({ breederId: first.breederId, author:{ name:'Анна' }, text: 'Які лінії доступні навесні?' })
      answerQuestion(q1.id, 'Плануємо Карніка та Карпатка.', 'breeder')
      addQuestion({ breederId: first.breederId, author:{ name:'Юрій' }, text: 'Чи надсилаєте за кордон?' }) // pending
    }
    // Seed queens for shop demo if none
    const queensRaw = localStorage.getItem('hb.queens')
    if (!queensRaw) {
      addQueensBatch({ count: 20, startQueenNo: 1, country:'UA', breedCode:'7', unionCode:'45', breederNo:'1', year: new Date().getFullYear(), baseTraits: { honey:70,winter:60,temperament:60,calmOnFrames:60,swarming:50,hygienic:60,varroaResist:50,springBuildUp:55,colonyStrength:60,broodFrames:50 }, breederId: 'B1', status:'listed' })
    }
  } catch (_) {
    // no-op in non-browser/test environments
  }
}

export default seedPublic
