export interface QuestionRequestDTO{
    specialty?:number;
    theme?:string;
    year?:string[];
    exam:string;
    count:number;
}
export interface QuestionResponseDTO{
    specialtyId:number;
    questionId:number;
    theme:string;
    specialty:string;
    question:string;
    image:string;
    comment:string;
    image_comment:string;
    options:QuestionOptionResponseDTO[];
    data:string;
    justification:string;
    distractorAnalysis:string;
    reference:string;
}


export interface QuestionOptionResponseDTO{
    optionId:number;
    option:string;
}

export interface QuestionByYearRequestDTO{
  year:string;
  exam:string;
}
export interface QuestionByYearResponseDTO{
    specialtyId:number;
    questionId:number;
    theme:string;
    specialty:string;
    question:string;
    image:string;
    comment:string;
    image_comment:string;
    options:QuestionOptionResponseDTO[];
    data:string;
    justification:string;
    distractorAnalysis:string;
    reference:string;
}
export interface QuestionByThemeRequestDTO{
    id:string;
}

export interface QuestionByThemeResponseDTO{
    specialtyId:number;
    questionId:number;
    theme:string;
    specialty:string;
    question:string;
    image:string;
    comment:string;
    image_comment:string;
    options:QuestionOptionResponseDTO[];
    data:string;
    justification:string;
    distractorAnalysis:string;
    reference:string;
}