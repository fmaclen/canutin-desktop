import PocketBase from 'pocketbase';
import readline from 'readline';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

const transactionCategories = {
	categoryGroups: [
		{
			categories: [
				{
					name: 'Entertainment & recreation'
				},
				{
					name: 'Museums'
				},
				{
					name: 'Music'
				},
				{
					name: 'Nightlife'
				},
				{
					name: 'Sports'
				},
				{
					name: 'Subscriptions'
				},
				{
					name: 'Theatres'
				},
				{
					name: 'Outdoors & parks'
				}
			],
			name: 'Entertainment & recreation'
		},
		{
			categories: [
				{
					name: 'Business & services'
				},
				{
					name: 'Contractors'
				},
				{
					name: 'Manufacturing'
				},
				{
					name: 'Office supplies'
				},
				{
					name: 'Postal & shipping'
				}
			],
			name: 'Business & services'
		},
		{
			categories: [
				{
					name: 'Books & supplies'
				},
				{
					name: 'Education'
				},
				{ name: 'Studen loan' }
			],
			name: 'Education'
		},
		{
			categories: [
				{
					name: 'Financial & banking'
				},
				{
					name: 'Cash'
				},
				{
					name: 'Fees'
				},
				{
					name: 'Financial services'
				},
				{
					name: 'Income'
				},
				{
					name: 'Interest'
				},
				{
					name: 'Payments'
				},
				{
					name: 'Transfers'
				},
				{
					name: 'Withdrawals'
				}
			],
			name: 'Financial & banking'
		},
		{
			categories: [
				{
					name: 'Food & drink'
				},
				{
					name: 'Bars'
				},
				{
					name: 'Coffee shops'
				},
				{
					name: 'Groceries'
				},
				{
					name: 'Restaurants'
				}
			],
			name: 'Food & drink'
		},
		{
			categories: [
				{
					name: 'Health'
				},
				{
					name: 'Fitness'
				},
				{
					name: 'Medical care'
				},
				{
					name: 'Pharmacies'
				}
			],
			name: 'Health'
		},
		{
			categories: [
				{
					name: 'Housing'
				},
				{
					name: 'Furnishings'
				},
				{
					name: 'Home improvement'
				},
				{
					name: 'Home maintenance'
				},
				{
					name: 'Home security'
				},
				{
					name: 'Mortgage'
				},
				{
					name: 'Rent'
				}
			],
			name: 'Housing'
		},
		{
			categories: [
				{
					name: 'Institutional'
				},
				{
					name: 'Insurance'
				},
				{
					name: 'Government'
				},
				{
					name: 'Legal'
				},
				{
					name: 'Religious'
				},
				{
					name: 'Taxes'
				}
			],
			name: 'Institutional'
		},
		{
			categories: [
				{
					name: 'Kids'
				},
				{
					name: 'Allowance'
				},
				{
					name: 'Child care'
				},
				{
					name: 'Kids supplies'
				},
				{
					name: 'Toys'
				}
			],
			name: 'Kids'
		},
		{
			categories: [
				{
					name: 'Personal'
				},
				{
					name: 'Charity'
				},
				{
					name: 'Gifts'
				},
				{
					name: 'Payroll & benefits'
				},
				{
					name: 'Personal care'
				}
			],
			name: 'Personal'
		},
		{
			categories: [
				{
					name: 'Pets'
				},
				{
					name: 'Pet services'
				},
				{
					name: 'Veterinary'
				}
			],
			name: 'Pets'
		},
		{
			categories: [
				{
					name: 'Shops'
				},
				{
					name: 'Arts & crafts'
				},
				{
					name: 'Clothing'
				},
				{
					name: 'Electronics'
				},
				{
					name: 'Hobbies'
				}
			],
			name: 'Shops'
		},
		{
			categories: [
				{
					name: 'Transportation'
				},
				{
					name: 'Automotive'
				},
				{
					name: 'Gas stations'
				},
				{
					name: 'Service & parts'
				},
				{
					name: 'Parking'
				},
				{
					name: 'Public transportation'
				},
				{
					name: 'Taxi & ride sharing'
				}
			],
			name: 'Transportation'
		},
		{
			categories: [
				{
					name: 'Travel'
				},
				{
					name: 'Air travel'
				},
				{
					name: 'Vehicle rentals'
				},
				{
					name: 'Buses & trains'
				},
				{
					name: 'Boats & cruises'
				},
				{
					name: 'Lodging'
				},
				{
					name: 'Vacation'
				}
			],
			name: 'Travel'
		},
		{
			categories: [
				{
					name: 'Utilities'
				},
				{
					name: 'Electricity'
				},
				{
					name: 'Gas'
				},
				{
					name: 'Internet & phone'
				},
				{
					name: 'Television'
				},
				{
					name: 'Water'
				},
				{
					name: 'Sanitary & waste management'
				}
			],
			name: 'Utilities'
		}
	]
};

const accountTypes = [
	{
		name: 'Checking'
	},
	{
		name: 'Savings'
	},
	{
		name: 'Cash-only HSA (US)'
	},
	{
		name: 'Certificate of deposit'
	},
	{
		name: 'Money market'
	},
	{
		name: 'PayPal'
	},
	{
		name: 'Prepaid debit card'
	},
	{
		name: 'Cash management'
	},
	{
		name: 'EBT (US)'
	},
	{
		name: 'Credit card'
	},
	{
		name: 'Auto loan'
	},
	{
		name: 'Commercial loan'
	},
	{
		name: 'Consumer loan'
	},
	{
		name: 'HELOC'
	},
	{
		name: 'General loan'
	},
	{
		name: 'Mortgage loan'
	},
	{
		name: 'Pre-approved overdraft'
	},
	{
		name: 'Pre-approved line of credit'
	},
	{
		name: 'Student loan'
	},
	{
		name: 'Other loan'
	},
	{
		name: '529 (US)'
	},
	{
		name: '401a (US)'
	},
	{
		name: '401k (US)'
	},
	{
		name: '403b (US)'
	},
	{
		name: '457b (US)'
	},
	{
		name: 'Brokerage'
	},
	{
		name: 'ISA (UK)'
	},
	{
		name: 'ESA (US)'
	},
	{
		name: 'Fixed annuity'
	},
	{
		name: 'GIC (Canada)'
	},
	{
		name: 'HRA (US)'
	},
	{
		name: 'HSA (US)'
	},
	{
		name: 'IRA (US)'
	},
	{
		name: 'ISA (UK)'
	},
	{
		name: 'Keogh self-employed retirement plan (US)'
	},
	{
		name: 'LIF (Canada)'
	},
	{
		name: 'LIRA (Canada)'
	},
	{
		name: 'LRIF (Canada)'
	},
	{
		name: 'LRSP (Canada)'
	},
	{
		name: 'Mutual fund'
	},
	{
		name: 'Non-taxable brokerage account'
	},
	{
		name: 'Pension'
	},
	{
		name: 'PRIF (Canada)'
	},
	{
		name: 'Profit share plan'
	},
	{
		name: 'Qualifying share account'
	},
	{
		name: 'RSDP (Canada)'
	},
	{
		name: 'RESP (Canada)'
	},
	{
		name: 'Retirement'
	},
	{
		name: 'RLIF (Canada)'
	},
	{
		name: 'Roth IRA (US)'
	},
	{
		name: 'Roth 401(k) (US)'
	},
	{
		name: 'RRIF (Canada)'
	},
	{
		name: 'RRSP (Canada)'
	},
	{
		name: 'SARSEP (US)'
	},
	{
		name: 'SEP IRA (US)'
	},
	{
		name: 'Simple IRA (US)'
	},
	{
		name: 'SIPP (UK)'
	},
	{
		name: 'Stock plan'
	},
	{
		name: 'TFSA (Canada)'
	},
	{
		name: 'Trust'
	},
	{
		name: 'UGMA (US)'
	},
	{
		name: 'UTMA (US)'
	},
	{
		name: 'Variable annuity'
	},
	{
		name: 'Other'
	}
];

const assetTypes = [
	{
		name: 'Currency'
	},
	{
		name: 'Security'
	},
	{
		name: 'Cryptocurrency'
	},
	{
		name: 'Collectible'
	},
	{
		name: 'Precious metal'
	},
	{
		name: 'Vehicle'
	},
	{
		name: 'Real state'
	},
	{
		name: 'Business'
	},
	{
		name: 'Other'
	}
];

function askForConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function main() {
	try {
		await pb.admins.authWithPassword('playwright@example.com', 'playwright');

		// Check if tags already exist
		const existingTags = await pb.collection('tags').getList(1, 1);
		
		if (existingTags.totalItems > 0) {
			const confirmed = await askForConfirmation('-> Tags already exist. Do you want to proceed with seeding? (y/n): ');
			if (!confirmed) {
				console.warn('-> Seeding cancelled by user');
				return;
			}
		}

		// Create transaction category tags
		for (const categoryGroup of transactionCategories.categoryGroups) {
			// Create group tag
			await pb.collection('tags').create({
				name: categoryGroup.name,
				for: 'transactions',
				isLabelGroup: true
			});

			// Create individual category tags
			for (const category of categoryGroup.categories) {
				await pb.collection('tags').create({
					name: category.name,
					for: 'transactions',
					isLabelGroup: false
				});
			}
		}

		// Create account type tags
		for (const accountType of accountTypes) {
			await pb.collection('tags').create({
				name: accountType.name,
				for: 'accounts',
				isLabelGroup: false
			});
		}

		// Create asset type tags
		for (const assetType of assetTypes) {
			await pb.collection('tags').create({
				name: assetType.name,
				for: 'assets',
				isLabelGroup: false
			});
		}

		console.warn('-> Seed data imported successfully');
	} catch (error) {
		console.warn('-> Error importing seed data:', error);
	}
}

main()
	.catch((e) => {
		console.warn('-> Error:', e);
		process.exit(1);
	});
