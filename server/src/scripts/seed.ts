import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IndustryFamilyService } from '../services/industryFamily.service';
import { CharacterTraitService } from '../services/characterTrait.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const industryFamilyService = app.get(IndustryFamilyService);
  const characterTraitService = app.get(CharacterTraitService);

  // Seed industry families
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Energy',
    'Transportation',
    'Media',
    'Real Estate'
  ];

  for (const industry of industries) {
    await industryFamilyService.createFamily(industry);
  }

  // Seed character trait schools
  const schools = [
    {
      name: 'Risk Tolerance',
      description: 'How comfortable someone is with taking risks'
    },
    {
      name: 'Growth Focus',
      description: 'How focused someone is on growth vs stability'
    },
    {
      name: 'Leadership Style',
      description: 'How someone approaches leadership and decision making'
    },
    {
      name: 'Communication Style',
      description: 'How someone prefers to communicate and collaborate'
    }
  ];

  for (const school of schools) {
    await characterTraitService.createSchool(school.name, school.description);
  }

  // Seed character traits
  const traits = [
    {
      name: 'Conservative',
      description: 'Prefers low-risk, stable investments',
      school: 'Risk Tolerance',
      index: 0
    },
    {
      name: 'Moderate',
      description: 'Balances risk and reward',
      school: 'Risk Tolerance',
      index: 1
    },
    {
      name: 'Aggressive',
      description: 'Comfortable with high-risk, high-reward investments',
      school: 'Risk Tolerance',
      index: 2
    },
    {
      name: 'Growth-Oriented',
      description: 'Focuses on rapid expansion and market capture',
      school: 'Growth Focus',
      index: 0
    },
    {
      name: 'Balanced',
      description: 'Balances growth with stability',
      school: 'Growth Focus',
      index: 1
    },
    {
      name: 'Stability-Focused',
      description: 'Prioritizes sustainable, steady growth',
      school: 'Growth Focus',
      index: 2
    }
  ];

  for (const trait of traits) {
    const school = await characterTraitService.getAllSchools()
      .then(schools => schools.find(s => s.name === trait.school));
    
    if (school) {
      await characterTraitService.createTrait(
        trait.name,
        trait.description,
        school._id.toString(),
        trait.index
      );
    }
  }

  await app.close();
}

bootstrap().catch(console.error); 