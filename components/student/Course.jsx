import React from "react";
import Assignment from "./Assignment";

const Course = ({
	unitName,
	unitId,
	unitCoordinator,
	unitWeeks,
	unitCredits,
	assessments,
	calculateCredits
}) => (
	<div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
		<h2 className="text-xl font-bold mb-1">{unitName}</h2>
		<p className="text-sm text-gray-500 mb-2">
			Code: {unitId} | Coordinator: {unitCoordinator} | Weeks: {unitWeeks}
		</p>
		<p className="font-semibold mb-3">Credits Earned: {calculateCredits ? calculateCredits({ unitId, unitCredits, assessments }) : 0} / {unitCredits}</p>

		{/* Scrollable Assignments */}
		<div className="h-48 overflow-y-auto space-y-2">
			{assessments && assessments.map((a) => (
				<Assignment
					key={a.id}
					title={a.title}
					grade={a.grade}
					status={a.status}
					// ...other assignment props as needed
				/>
			))}
		</div>
	</div>
);

export default Course;
