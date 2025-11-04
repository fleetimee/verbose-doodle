import type { Endpoint, GroupedEndpoints } from "./types";

/**
 * Group endpoints by biller name
 * @param endpoints - Array of endpoints to group
 * @returns Array of grouped endpoints sorted alphabetically by biller name
 */
export function groupEndpointsByBiller(
	endpoints: Endpoint[],
): GroupedEndpoints[] {
	if (endpoints.length === 0) {
		return [];
	}

	const groups = new Map<
		string,
		{ billerId: number; billerName: string; endpoints: Endpoint[] }
	>();

	for (const endpoint of endpoints) {
		const billerName = endpoint.billerName || `Biller ID ${endpoint.billerId}`;
		const existing = groups.get(billerName);

		if (existing) {
			existing.endpoints.push(endpoint);
		} else {
			groups.set(billerName, {
				billerId: endpoint.billerId,
				billerName,
				endpoints: [endpoint],
			});
		}
	}

	// Sort groups alphabetically by biller name
	const sortedGroups = Array.from(groups.values()).sort((a, b) =>
		a.billerName.localeCompare(b.billerName),
	);

	return sortedGroups;
}

/**
 * Filter endpoints by search query
 * @param endpoints - Array of endpoints to filter
 * @param query - Search query string
 * @returns Filtered array of endpoints
 */
export function filterEndpoints(
	endpoints: Endpoint[],
	query: string,
): Endpoint[] {
	const searchQuery = query.trim().toLowerCase();

	if (searchQuery.length === 0) {
		return endpoints;
	}

	return endpoints.filter((endpoint) => {
		const matchesUrl = endpoint.url.toLowerCase().includes(searchQuery);
		const matchesMethod = endpoint.method.toLowerCase().includes(searchQuery);
		const matchesBillerId = endpoint.billerId
			.toString()
			.includes(searchQuery);
		const matchesBillerName = endpoint.billerName
			?.toLowerCase()
			.includes(searchQuery);
		const matchesResponse = endpoint.responses.some((response) =>
			response.name.toLowerCase().includes(searchQuery),
		);

		return (
			matchesUrl ||
			matchesMethod ||
			matchesBillerId ||
			matchesBillerName ||
			matchesResponse
		);
	});
}
