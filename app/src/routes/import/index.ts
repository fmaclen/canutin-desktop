import importFromCanutinFile from '$lib/helpers/importFromCanutinFile';

export const GET = async () => {
	const success = await importFromCanutinFile();

	return {
		status: success ? 200 : 500
	};
};
