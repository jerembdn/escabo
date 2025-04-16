type Options = {
	method: string;
	username?: string;
	password?: string;
	serverUri: string;
	databaseName: string;
	params?: string;
};

export const buildDsn = ({
	method,
	username = "",
	password = "",
	serverUri,
	databaseName,
	params,
}: Options): string => {
	const paramsArray = params.split(",");
	const finalParams =
		paramsArray && paramsArray.length > 0 ? params.split(",").toString() : "";

	if (method.includes("srv")) {
		return `${method}://${username}:${password}@${serverUri}/${databaseName}?${finalParams}`;
	}

	return `${method}://${serverUri}/${databaseName}?${finalParams}`;
};
